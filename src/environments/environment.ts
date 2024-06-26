// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  baseUrl: "http://ec2-54-229-248-35.eu-west-1.compute.amazonaws.com:8080",
  assetUrl: "http://vanguard-dev-fb382b996773a66cd49ca06f5b5ccc93.s3.me-south-1.amazonaws.com"
};
