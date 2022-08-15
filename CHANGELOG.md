# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Types of changes:
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

> Date format: YYYY-MM-DD

> If we have some "Breaking changes" we can mark it in message by `**BREAKING**` preffix, like:  
> `- **BREAKING**: Some message`

-------------

## TODOs
> Todo list for future

- ...

-------------
## 4.9.1 - 2022-08-15
### Fixed
- `updateImage` method when image doesn't have low-preivew.

## 4.9.0 - 2022-08-11
### Added
- Possibility to change ci-src and process image.

## 4.8.13 - 2022-08-05
### Fixed
- Undefined hostname when adding relative src

## 4.8.12 - 2022-05-10
### Fixed
- Low preview image width

## 4.8.11 - 2022-04-25
### Fixed
- Low preview image width

## 4.8.10 - 2022-04-25
### Fixed
- Image width (w) param.

## 4.8.9 - 2022-04-25
### Changed
- update documentation

## 4.8.8 - 2022-04-25
### Changed
- update documentation

## 4.8.7 - 2022-04-18
### Added
- possibility to add `doNotReplaceURL` to single image

## 4.8.6 - 2022-03-29
### Fixed
- remove token from custom CNAME

## 4.8.5 - 2022-02-09
### Fixed
- change devicePixelRatioList to [1, 1.5, 2]

## 4.8.4 - 2022-01-04
### Fixed
- removed hardcoded ci_info query parameter to fix image caching

## 4.8.3 - 2021-12-09
### Fixed
- img-src starts with "//"

## 4.8.2 - 2021-11-08

### Fixed
- possibility to remove API version in blur-hash, low-preview, wp and plain
## 4.8.1 - 2021-08-17

### fixed

- Minifying build in low preview
## 4.8.0 - 2021-06-16

### Deprecated

Property **ignoreNodeImgSize** is deprecated. Use **imageSizeAttributes: 'ignore'** instead

### Added
- new property: **imageSizeAttributes**
## 4.7.0 - 2020-02-23
### added
- add custom root element to process function
- process result coudimage URL before inserting into dom (plain version only)

### fixed
- banners in build files

## 4.6.8 - 2020-02-04
### fixed
- problem with background images with no children

## 4.6.7 - 2020-02-03
### fixed
- problem with rendering images inside background image

## 4.6.6 - 2020-1-20
### updated
- highlight js

## 4.6.5 - 2020-11-09
### updated
- utils version to add src to each size

## 4.6.4 - 2020-11-04
### updated
- utils version to fix getComputed function
## 4.6.3 - 2020-11-02
### updated
- utils version to enable params by queries

## 4.6.2 - 2020-11-02
### updated
- utils version 

## 4.6.1 - 2020-09-03
### Fixed
- background images doesn't appear

## 4.6.0 - 2020-07-27
### Added
- possibility to change cloudimage responsive selector
