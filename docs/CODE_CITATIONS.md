# Code Citations

This provenance record consolidates third-party code-similarity citations produced during earlier development. The cited material related to IAM-policy structure and does not serve as the portfolio’s current AWS configuration guidance.

| License reported by the citation tool | Source |
|---|---|
| MIT | [DoSomething infrastructure — CircleCI policy template](https://github.com/DoSomething/infrastructure/blob/dd3aad909b7c62862dec9f726dbd98bea52f09dc/shared/circleci-policy.json.tpl) |
| Apache-2.0 | [Protofire Polkadot failover mechanism — AWS security configuration](https://github.com/protofire/polkadot-failover-mechanism/blob/7501429b1bb39ca8f6e9e7c8f6adaf8f3aee8df2/aws/security.tf) |

The previous generated report repeated the same partial policy fragment for both sources. That fragment has been removed from this document to avoid presenting historical, account-specific IAM instructions as current architecture. The portfolio’s current least-privilege resource and compute-role model is documented in [AWS Infrastructure](AWS_INFRASTRUCTURE.md).
