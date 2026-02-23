export const aegisDemos = {
    scenarios: [
        {
            id: 'tool_exfiltration',
            command: 'aegis run --scenario tool_exfiltration --policy strict',
            output: `[INIT] Loading scenario: tool_exfiltration
[POLICY] Using policy: strict_v2.1
[RUN] Trace started...
[EVENT] Tool: 'curl' invoked with destination: '10.0.8.2'
[ANALYSIS] Destination not in allowed egress list.
[POLICY_V] Violation: Unsanctioned_Egress (Severity: HIGH)
[ACTION] Blocking request... DONE
[REPORT] Trace complete. Policy violations found: 1`,
            explanation: "Demonstrates AEGIS's ability to monitor runtime tool usage and block unsanctioned network egress based on strict behavioral policies."
        },
        {
            id: 'core_bench',
            command: 'aegis bench --suite core --policy strict',
            output: `[BENCH] Running suite: core (50 test cases)
[PROGRESS] .................................................. 100%
[RESULTS]
- Policy Compliance: 98.2%
- Average Latency: 1.4ms
- Anomalies Detected: 0
- False Positives: 1
[SUMMARY] Benchmark passed. Performance within bounds.`,
            explanation: "Shows how AEGIS measures the performance overhead of security policies, ensuring low-latency enforcement for production environments."
        },
        {
            id: 'eval_trace',
            command: 'aegis eval --trace sample_trace.jsonl',
            output: `[EVAL] Loading trace: sample_trace.jsonl
[PARSING] 1,402 events found.
[SCAN] Identifying behavioral patterns...
[MATCH] Pattern found: 'Recursive_File_Access'
[MATCH] Pattern found: 'Credential_Store_Discovery'
[EVAL] Risk Score: 84/100
[ALERT] Potential: Data_Discovery_Attack`,
            explanation: "Illustrates the post-mortem analysis capabilities. AEGIS scans raw system traces to reconstruct and score complex attack patterns."
        }
    ]
};

export const securityChallenge = {
    snippet: `// Scenario: LLM-powered support bot
// Policy allows using the 'KnowledgeBase' tool only.
const response = await llm.generate({
  prompt: userInput,
  tools: ['KnowledgeBase', 'DirectDatabaseQuery']
});`,
    question: "Where is the risk in this tool configuration?",
    choices: [
        {
            id: 'overprivilege',
            label: "Over-privileged tool access",
            isCorrect: true,
            explanation: "The LLM is given access to 'DirectDatabaseQuery' which exceeds the stated policy requirement. An attacker could use Prompt Injection to query sensitive user tables directly.",
            docLink: "https://github.com/cleamax/aegis#threat-model"
        },
        {
            id: 'latency',
            label: "Performance latency",
            isCorrect: false,
            explanation: "While using multiple tools might add slight latency, the primary risk here is the security boundary violation, not speed.",
            docLink: "https://github.com/cleamax/aegis#architecture"
        },
        {
            id: 'parsing',
            label: "JSON parsing error",
            isCorrect: false,
            explanation: "The snippet is syntactically correct JS. The flaw lies in the security architecture (excessive permissions), not the code structure.",
            docLink: "https://github.com/cleamax/aegis#implementation"
        }
    ]
};

export const projectUpgrades = {
    "attack-surface-scanner": {
        problem: "Modern SaaS environments have invisible sprawl. Manually tracking every subdomain and TLS config is impossible at scale.",
        approach: "Built a passive discovery engine that consumes Certificate Transparency logs to find assets before attackers do.",
        nextSteps: "Integrate with AWS Route53 APIs to correlate public DNS with internal VPC configurations."
    },
    "signalforge": {
        problem: "Security logs are noisy and heterogeneous. Teams struggle to correlate raw events into meaningful attack paths.",
        approach: "Designed a normalization layer that maps diverse logs into a common schema for deterministic rule matching.",
        nextSteps: "Add support for streaming ingestion via Kafka and real-time behavioral clustering."
    }
};

export const engineeringDecisions = [
    {
        title: "Rule-based evaluation over ML",
        decision: "Used deterministic rule-matched policies as the primary evaluation layer.",
        why: "In security contexts, explainability is paramount. Rules provide a clear audit trail for why a violation was triggered.",
        alternatives: "Large Language Models (LLMs) used directly for evaluation.",
        tradeoff: "Accepted higher manual effort in rule definition for 100% predictable and reproducible results."
    },
    {
        title: "Spec-driven scoring engine",
        decision: "Implemented a schema-validated risk scoring system (1-100).",
        why: "Ensures consistency across different trace types and provides a quantifiable metric for security posture.",
        alternatives: "Ad-hoc severity labels (Low/Medium/High).",
        tradeoff: "Requires upfront definition of risk weightings, but enables automated CI/CD gating based on score thresholds."
    },
    {
        title: "CLI-first architecture",
        decision: "Prioritized a robust command-line interface as the core interaction point.",
        why: "Security tools must be pipeline-native. CLI-first design ensures easy integration into GitHub Actions and local dev scripts.",
        alternatives: "GUI/Dashboard-first approach.",
        tradeoff: "Steeper initial learning curve for non-technical users, but higher utility for the intended engineering audience."
    }
];
