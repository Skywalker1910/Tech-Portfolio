# Code Citations

## License: MIT
https://github.com/DoSomething/infrastructure/blob/dd3aad909b7c62862dec9f726dbd98bea52f09dc/shared/circleci-policy.json.tpl

```
That makes sense — newer Amplify Hosting for Next.js uses managed compute, not user-visible Lambda functions. The runtime role is `AmplifySSRLoggingRole-ef15eb65` (despite the misleading name, it's the actual execution role for SSR routes).

The build log showed exactly why env vars aren't reaching the runtime:
```
SSM params {"Path":"/amplify/d1p2z2pdfp9af0/main/","WithDecryption":true}
WARNING: !Failed to set up process.env.secrets
```

Amplify reads env vars from SSM at runtime, but the role has no SSM read permissions. Fix both problems at once by adding an inline policy to `AmplifySSRLoggingRole-ef15eb65`:

Go to **IAM > Roles > AmplifySSRLoggingRole-ef15eb65 > Add permissions > Create inline policy > JSON** and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParametersByPath",
        "ssm:GetParameters",
        "ssm:GetParameter"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/amplify/d1p2z2pdfp9af0/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:
```


## License: Apache-2.0
https://github.com/protofire/polkadot-failover-mechanism/blob/7501429b1bb39ca8f6e9e7c8f6adaf8f3aee8df2/aws/security.tf

```
That makes sense — newer Amplify Hosting for Next.js uses managed compute, not user-visible Lambda functions. The runtime role is `AmplifySSRLoggingRole-ef15eb65` (despite the misleading name, it's the actual execution role for SSR routes).

The build log showed exactly why env vars aren't reaching the runtime:
```
SSM params {"Path":"/amplify/d1p2z2pdfp9af0/main/","WithDecryption":true}
WARNING: !Failed to set up process.env.secrets
```

Amplify reads env vars from SSM at runtime, but the role has no SSM read permissions. Fix both problems at once by adding an inline policy to `AmplifySSRLoggingRole-ef15eb65`:

Go to **IAM > Roles > AmplifySSRLoggingRole-ef15eb65 > Add permissions > Create inline policy > JSON** and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParametersByPath",
        "ssm:GetParameters",
        "ssm:GetParameter"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/amplify/d1p2z2pdfp9af0/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:
```


## License: MIT
https://github.com/DoSomething/infrastructure/blob/dd3aad909b7c62862dec9f726dbd98bea52f09dc/shared/circleci-policy.json.tpl

```
That makes sense — newer Amplify Hosting for Next.js uses managed compute, not user-visible Lambda functions. The runtime role is `AmplifySSRLoggingRole-ef15eb65` (despite the misleading name, it's the actual execution role for SSR routes).

The build log showed exactly why env vars aren't reaching the runtime:
```
SSM params {"Path":"/amplify/d1p2z2pdfp9af0/main/","WithDecryption":true}
WARNING: !Failed to set up process.env.secrets
```

Amplify reads env vars from SSM at runtime, but the role has no SSM read permissions. Fix both problems at once by adding an inline policy to `AmplifySSRLoggingRole-ef15eb65`:

Go to **IAM > Roles > AmplifySSRLoggingRole-ef15eb65 > Add permissions > Create inline policy > JSON** and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParametersByPath",
        "ssm:GetParameters",
        "ssm:GetParameter"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/amplify/d1p2z2pdfp9af0/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:
```


## License: Apache-2.0
https://github.com/protofire/polkadot-failover-mechanism/blob/7501429b1bb39ca8f6e9e7c8f6adaf8f3aee8df2/aws/security.tf

```
That makes sense — newer Amplify Hosting for Next.js uses managed compute, not user-visible Lambda functions. The runtime role is `AmplifySSRLoggingRole-ef15eb65` (despite the misleading name, it's the actual execution role for SSR routes).

The build log showed exactly why env vars aren't reaching the runtime:
```
SSM params {"Path":"/amplify/d1p2z2pdfp9af0/main/","WithDecryption":true}
WARNING: !Failed to set up process.env.secrets
```

Amplify reads env vars from SSM at runtime, but the role has no SSM read permissions. Fix both problems at once by adding an inline policy to `AmplifySSRLoggingRole-ef15eb65`:

Go to **IAM > Roles > AmplifySSRLoggingRole-ef15eb65 > Add permissions > Create inline policy > JSON** and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParametersByPath",
        "ssm:GetParameters",
        "ssm:GetParameter"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/amplify/d1p2z2pdfp9af0/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:
```

