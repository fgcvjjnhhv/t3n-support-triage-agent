wit_bindgen::generate!({
    world: "support-triage",
    path: "wit",
    additional_derives: [serde::Deserialize, serde::Serialize],
    generate_all,
});

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct Ticket {
    case_ref: String,
    message: String,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
struct TriageResult {
    case_ref: String,
    priority: &'static str,
    category: &'static str,
    route_to: &'static str,
    response_policy: &'static str,
}

fn triage(input: &[u8]) -> Result<Vec<u8>, String> {
    if input.len() > 8_192 {
        return Err("ticket payload exceeds 8192 bytes".into());
    }
    let ticket: Ticket = serde_json::from_slice(input)
        .map_err(|_| "ticket payload must contain case_ref and message".to_string())?;
    if ticket.case_ref.is_empty() || ticket.case_ref.len() > 64 {
        return Err("case_ref must be between 1 and 64 bytes".into());
    }
    if ticket.message.trim().is_empty() || ticket.message.len() > 4_096 {
        return Err("message must be between 1 and 4096 bytes".into());
    }

    let message = ticket.message.to_lowercase();
    let result = if [
        "account takeover",
        "unauthorized access",
        "security breach",
        "stolen account",
    ]
    .iter()
    .any(|needle| message.contains(needle))
    {
        TriageResult {
            case_ref: ticket.case_ref,
            priority: "P0",
            category: "account_security",
            route_to: "security_on_call",
            response_policy: "human_review_required_no_automated_resolution",
        }
    } else if [
        "charged twice",
        "duplicate charge",
        "payment failed",
        "refund",
    ]
    .iter()
    .any(|needle| message.contains(needle))
    {
        TriageResult {
            case_ref: ticket.case_ref,
            priority: "P1",
            category: "billing",
            route_to: "billing_support",
            response_policy: "verify_transaction_before_refund",
        }
    } else if ["cannot log in", "can't log in", "locked out", "login issue"]
        .iter()
        .any(|needle| message.contains(needle))
    {
        TriageResult {
            case_ref: ticket.case_ref,
            priority: "P2",
            category: "account_access",
            route_to: "customer_support",
            response_policy: "send_account_recovery_steps",
        }
    } else {
        TriageResult {
            case_ref: ticket.case_ref,
            priority: "P3",
            category: "general_support",
            route_to: "customer_support",
            response_policy: "human_review_before_reply",
        }
    };

    serde_json::to_vec(&result).map_err(|_| "could not encode triage result".into())
}

#[cfg(target_arch = "wasm32")]
struct Component;

#[cfg(target_arch = "wasm32")]
impl exports::z::support_triage::contracts::Guest for Component {
    fn triage_ticket(
        req: exports::z::support_triage::contracts::GenericInput,
    ) -> Result<Vec<u8>, String> {
        let input = req.input.ok_or("triage-ticket: missing input")?;
        triage(&input)
    }
}

#[cfg(target_arch = "wasm32")]
export!(Component);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn security_issues_route_to_human_security_review() {
        let result = triage(br#"{"case_ref":"CASE-101","message":"I see an account takeover and unauthorized access"}"#).unwrap();
        let parsed: serde_json::Value = serde_json::from_slice(&result).unwrap();
        assert_eq!(parsed["priority"], "P0");
        assert_eq!(parsed["route_to"], "security_on_call");
        assert_eq!(
            parsed["response_policy"],
            "human_review_required_no_automated_resolution"
        );
    }

    #[test]
    fn pii_like_ticket_text_is_never_copied_to_the_result() {
        let result = triage(br#"{"case_ref":"CASE-102","message":"Call me at 212-555-0199 or mail jane@example.com"}"#).unwrap();
        let output = String::from_utf8(result).unwrap();
        assert!(!output.contains("212-555-0199"));
        assert!(!output.contains("jane@example.com"));
        assert!(output.contains("CASE-102"));
    }

    #[test]
    fn security_priority_wins_over_billing_keywords() {
        let result = triage(
            br#"{"case_ref":"CASE-103","message":"Account takeover, and I was charged twice"}"#,
        )
        .unwrap();
        let parsed: serde_json::Value = serde_json::from_slice(&result).unwrap();
        assert_eq!(parsed["priority"], "P0");
        assert_eq!(parsed["category"], "account_security");
    }

    #[test]
    fn malformed_or_oversized_input_fails_closed() {
        assert!(triage(b"not json").is_err());
        assert!(triage(&vec![b'x'; 8_193]).is_err());
        assert!(triage(br#"{"case_ref":"","message":"hello"}"#).is_err());
    }
}

