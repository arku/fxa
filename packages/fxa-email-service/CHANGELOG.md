## 1.141.0

### Bug fixes

- smtp: fix broken smtp provider implementation (6488309de)

### Other changes

- deps: update socketlabs-rs dependency (c7ed6f46b)
- deps: remove unused mozsvc-common dependency (fd25e7b23)
- package: update rust and dependencies (fc7d569f2)

## 1.140.3

No changes.

## 1.140.2

No changes.

## 1.140.1

No changes.

## 1.140.0

No changes.

## 1.139.2

No changes.

## 1.139.1

No changes.

## 1.139.0

No changes.

## 1.138.4

No changes.

## 1.138.3

No changes.

## 1.138.2

No changes.

## 1.138.1

No changes.

## 1.138.0

No changes.

## 1.137.4

No changes.

## 1.137.3

No changes.

## 1.137.2

No changes.

## 1.137.1

No changes.

## 1.137.0

No changes.

## 1.136.6

No changes.

## 1.136.5

No changes.

## 1.136.4

No changes.

## 1.136.3

No changes.

## 1.136.2

No changes.

## 1.136.1

No changes.

## 1.136.0

No changes.

## 1.135.6

No changes.

## 1.135.5

No changes.

## 1.135.4

No changes.

## 1.135.3

No changes.

## 1.135.2

No changes.

## 1.135.1

No changes.

## 1.135.0

### New features

- ci: build docs and push to gh-pages branch (69fea40b9)

### Bug fixes

- tests: pick up latest auth db in auth server tests (f78826aa2)
- ci: run tests for email service/event proxy (1bafed3f9)

### Other changes

- tests: remove api::send::test::unicode_email_field (e041f9564)
- packages: remove old release tagging scripts and docs (6f168c244)

## 1.134.5

No changes.

## 1.134.4

No changes.

## 1.134.3

No changes.

## 1.134.2

No changes.

## 1.130.0

### Bug fixes

- api: use correct apostrophe character in email address regex (b16f52e)

## 1.127.0

### New features

- types: implement a serializable regex type (83d46ae)
- code: update to rust 2018 (e77ea7a)

### Bug fixes

- scripts: ignore merge commits when generating changelog (489306b)
- errors: convert ses invalid domain error into a 400 (5926a06)
- db: remove unused DataType (d807e21)

### Refactorings

- settings: implement Default in enum_boilerplate! (a9c9a1b)
- settings: promote LogFormat and LogLevel to enums (1ec10e9)

### Other changes

- docs: minor readme editorialisation (8c8e29a)
- deps: update sendgrid (bf5486f)

## 1.126.0

### Refactorings

- settings: rename `BounceLimit(s)` to `DeliveryProblemLimit(s)` (1d5e817)
- settings: promote Env to an enum from a wrapped string (dba93f0)

### Other changes

- build: lower the debug level to decrease binary size (91a5173)
- package: create an automated release script (05acce1)

## 1.125.2 (2018-11-20)

#### Bug Fixes

- **sentry:** stop passing 4xx errors to Sentry ([3fed1052](3fed1052))

## 1.125.1 (2018-11-15)

#### Bug Fixes

- **ci:** enable branch builds in travis ([14491612](14491612))
- **headers:** propagate the Content-Language header ([67ebf3fe](67ebf3fe))
- **ses:**
  - add Sender header ([3e278667](3e278667))
  - ensure html part gets charset=utf-8 content type ([67320d28](67320d28))

## 1.125.0 (2018-11-14)

#### Bug Fixes

- **cargo:** remove old rocket comment ([c706d760](c706d760))
- **sentry:** capture errors at point of creation rather than when logged ([02408f59](02408f59))
- **settings:** fix panic when sentry is disabled ([4f47e93b](4f47e93b))

#### Features

- **bounces:** use timestamps from ses instead of the current time ([906f3911](906f3911), closes [#205](205))
- **settings:** extract provider type to a fully-fledged enum ([0bd766d4](0bd766d4))
- **types:** ignore display name part when parsing email addresses ([5d5ae603](5d5ae603), closes [#201](201))

## 1.124.1 (2018-11-07)

#### Bug Fixes

- **mime:** use base64 encoding instead of 8bit ([5d03a48d](5d03a48d))

## 1.124.0 (2018-10-30)

#### Features

- **db:**
  - write bounce and complaint records to our own db ([ed83e5b1](ed83e5b1))
  - serialize to JSON on write and deserialize from JSON on read ([31da83bb](31da83bb))
- **docs:**
  - mention command-line shortcuts for running binaries ([6d04dcc9](6d04dcc9))
  - promote fxa-local-dev as a first class way to run locally ([80bb9864](80bb9864))

#### Bug Fixes

- **ci:** only build deployment artifacts for tags ([95e20e07](95e20e07))
- **code:**
  - remove references to old rocket_contrib::JsonValue struct ([c152bc87](c152bc87))
  - implement AsRef<str> for cheaper/cleaner &str access ([48cff692](48cff692), closes [#211](211))
- **queues:** fix the serialized format of outgoing notifications ([e3e361c6](e3e361c6))
- **redis:** don't pollute our data store with old bounce nomenclature ([68a1def7](68a1def7))
- **settings:** remove references to RocketLoggingLevel::Off enum variant ([5530fddb](5530fddb))

## 1.122.0 (2018-10-02)

#### Bug Fixes

- **config:**
  - ignore empty environment variables ([85529f7f](85529f7f))
  - update config version in Cargo.toml ([9a882094](9a882094))
- **queues:** remove unused fields from notification structs ([0f2b5740](0f2b5740))

## 1.121.0 (2018-09-18)

#### Features

- **chore:** utilize a rust-toolchain file ([3903f0b9](3903f0b9))

## 1.120.0 (2018-09-06)

#### Features

- **docs:** document errors and errno ([482f69ce](482f69ce))
- **errors:** return bouncedAt field in bounce error message ([d74eaec9](d74eaec9))

## 1.119.0 (2018-08-22)

#### Features

- **logging:** add sentry support (#176) r=@vladikoff ([73d07bd7](73d07bd7))
- **socketlabs:** create and return id for socketlabs messages ([30639fc3](30639fc3))

#### Bug Fixes

- **logging:** remove unnecessary and add debug logs in queues (#177) r=@vladikoff ([0f790c16](0f790c16))
- **queues:**
  - make queue parsing logic follow the sns format (#178) r=@vladikoff ([7beca536](7beca536))
  - fix executor error on queues process (#174) r=@vladikoff,@philbooth ([5e9f2688](5e9f2688))

## 1.118.0 (2018-08-09)

#### Bug Fixes

- **ses:** use updated rusoto version that sends message in body (#164) r=@vladikoff ([c085cbb3](c085cbb3))

## 1.117.0 (2018-08-01)

#### Features

- **settings:**
  - enable the default provider to override requests ([ca4b2011](ca4b2011))
  - add secret_key to settings (#147) r=@vladikoff ([1db8d449](1db8d449), closes [#146](146))

## 1.116.3 (2018-07-26)

#### Refactor

- **settings:** drop NODE_ENV and add LOG_LEVEL (#141) r=@vladikoff

#### Features

- **providers:** create socketlabs provider ([13cd2213](13cd2213))

## 1.116.2 (2018-07-19)

#### Bug Fixes

- **docker:** Rocket.toml no longer exists, so don't copy it (#136) ([b915b7e8](b915b7e8))

## 1.116.1 (2018-07-18)

#### Features

- **project:** create healthcheck endpoints and make \$PORT an env variable (#134) r=@philbooth,@vladikoff ([b69cfb53](b69cfb53), closes [#132](132), [#133](133))

#### Bug Fixes

- **deploy:** pin to a known compatible rust version in docker and ci (#131) r=@vladikoff ([7512acf0](7512acf0), closes [#130](130))
- **docker:** include /app/version.json in final image (dockerflow required) (#129) ([16f7630f](16f7630f))

## 1.116.0 (2018-07-12)

#### Breaking Changes

- **logging:** turn off rocket logs for production (#125) r=@vladikoff ([825e3993](825e3993), closes [#111](111))

#### Bug Fixes

- **docs:** better docs for the settings module ([ba9f8b88](ba9f8b88))
- **scripts:**
  - don't try to deploy docs if they haven't changed ([e6e3350c](e6e3350c))
  - stop gh-pages script from failing for pull requests ([8e48f36e](8e48f36e))
  - update references to bin names with `fxa-email-` prefix ([fb56a209](fb56a209))
- **settings:** get message data hmac key setting to work with env variables (#110) r=@philbooth,@vladikoff ([90bec93f](90bec93f), closes [#109](109))

#### Features

- **docker:**
  - copy Rocket.toml in the docker image (#107) r=@brizental ([05f93b9d](05f93b9d), closes [#106](106))
  - set ROCKET_ENV to prod (#105) r=@brizental ([b3e3ac29](b3e3ac29))
- **docs:** generate developer docs with rustdoc ([f2edb78c](f2edb78c))
- **logging:**
  - turn off rocket logs for production (#125) r=@vladikoff ([825e3993](825e3993), closes [#111](111))
  - add null logger for testing environment (#102) r=@philbooth,@vladikoff ([199cd825](199cd825), closes [#82](82))
- **providers:** implement smtp provider ([20b7fc08](20b7fc08))

## 1.115.0 (2018-06-26)

#### Bug Fixes

- **api:** limit `to` field to a single recipient ([b6dad721](b6dad721))
- **bounces:** ensure db errors don't get converted to 429 responses (#59) r=@vladikoff ([5986e841](5986e841))
- **config:** inject config in rocket managed state ([50f8d523](50f8d523))
- **db:**
  - fix broken BounceSubtype deserialization ([fa796dfe](fa796dfe))
  - add missing derive(Debug) ([da70321d](da70321d))
  - add missing fields/values to auth_db::BounceRecord ([79e0ea31](79e0ea31))
- **errors:**
  - return JSON payloads for error responses ([b5343d54](b5343d54))
  - include more useful messages in wrapping errors ([58bf9bec](58bf9bec))
- **logging:** add mozlog logging for requests ([49ed73cd](49ed73cd))
- **queues:**
  - use correct name when deserializing bouncedRecipients ([0cc089e9](0cc089e9))
  - accept partially-filled notifications from sendgrid ([0a6c0432](0a6c0432))
  - fix nonsensical parse logic for sqs notifications ([1c21d6ec](1c21d6ec))
- **sendgrid:** return message id from the sendgrid provider ([fe8ec12f](fe8ec12f))
- **validation:**
  - make email regex less restrictive (#86) r=@vladikoff,@rfk,@philbooth ([3ec3e039](3ec3e039), closes [#81](81))
  - relax the sendgrid API key validation regex (#55) r=@vbudhram,@vladikoff ([008f1191](008f1191))
  - allow RFC5321 compliant email addresses ([66f5d5c0](66f5d5c0), closes [#44](44))

#### Features

- **api:** implement a basic /send endpoint ([6c3361c2](6c3361c2))
- **config:** add configuration ([a86015fb](a86015fb))
- **db:**
  - implement AuthDb::create_bounce ([ca44a94b](ca44a94b))
  - check the emailBounces table before sending email ([490a69e1](490a69e1))
- **docs:** add a readme doc ([5fd4e6aa](5fd4e6aa))
- **logging:** add mozlog to settings and scrub sensitive data (#74) r=@philbooth,@vladikoff ([f4271b9e](f4271b9e), closes [#18](18))
- **metadata:**
  - send message metadata in outgoing notifications (#73) r=@vladikoff,@brizental ([2aa1459d](2aa1459d), closes [#4](4))
  - store caller-specific metadata with the message id ([98b738a9](98b738a9))
- **providers:** add custom headers option ([efb8f0d7](efb8f0d7))
- **queues:**
  - return futures instead of blocking for queue handling ([6c154a04](6c154a04))
  - handle SES bounce, complaint and delivery notifications ([4338f24c](4338f24c))
- **sendgrid:** implement basic sending via sendgrid ([25947a96](25947a96))
- **ses:**
  - add support for aws access and secret keys ([da3cdf69](da3cdf69))
  - implement basic ses-based email sending ([4ab1d9ce](4ab1d9ce))
