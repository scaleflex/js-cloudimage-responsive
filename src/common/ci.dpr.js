import { generateURL } from 'cloudimage-responsive-utils/dist/utils/generate-url';
import { DEVICE_PIXEL_RATIO_LIST } from 'cloudimage-responsive-utils/dist/constants';


/**
 * The only device pixel ratio values cloudimage-responsive-utils can resolve.
 *
 * determine-container-props.js precomputes one size per entry of this list, and
 * generate-url.js then looks the size up *positionally*:
 *   sizes[DEVICE_PIXEL_RATIO_LIST.indexOf(devicePixelRatio)]
 * A ratio that is not exactly one of these values yields `undefined`, so the URL
 * is emitted with no `w`/`h` at all - i.e. the full-size original. Hence the
 * clamp in normalizeDevicePixelRatioList below.
 *
 * Re-exported rather than re-declared on purpose: when the dependency's list
 * changes, the supported set and the precomputed sizes stay in sync.
 */
const SUPPORTED_DEVICE_PIXEL_RATIO_LIST = DEVICE_PIXEL_RATIO_LIST;

const warn = (message) => {
  // eslint-disable-next-line no-console
  if (typeof console !== 'undefined' && console.warn) console.warn(`[js-cloudimage-responsive] ${message}`);
};

/**
 * Coerce, de-duplicate and sort a user-supplied devicePixelRatioList, dropping
 * values the URL generator cannot resolve. An empty array is preserved as the
 * documented "no retina support" opt-out.
 *
 * @param {*} list - the devicePixelRatioList config value
 * @return {Number[]} a list of supported ratios, ascending
 */
const normalizeDevicePixelRatioList = (list) => {
  if (!Array.isArray(list)) {
    if (list !== undefined && list !== null) {
      warn(`devicePixelRatioList must be an array, got ${typeof list}. `
        + `Falling back to [${SUPPORTED_DEVICE_PIXEL_RATIO_LIST.join(', ')}].`);
    }

    return SUPPORTED_DEVICE_PIXEL_RATIO_LIST.slice();
  }

  const normalized = [];
  const unsupported = [];

  list.forEach((value) => {
    const dpr = typeof value === 'number' ? value : parseFloat(value);

    if (SUPPORTED_DEVICE_PIXEL_RATIO_LIST.indexOf(dpr) === -1) {
      unsupported.push(value);
    } else if (normalized.indexOf(dpr) === -1) {
      normalized.push(dpr);
    }
  });

  if (unsupported.length) {
    warn(`devicePixelRatioList: ignoring unsupported value(s) ${unsupported.join(', ')}. `
      + `Supported values are ${SUPPORTED_DEVICE_PIXEL_RATIO_LIST.join(', ')}.`);
  }

  // Every value was unsupported (a typo, not an opt-out) - keep retina working.
  if (!normalized.length && list.length) return SUPPORTED_DEVICE_PIXEL_RATIO_LIST.slice();

  // Ascending order is required by the de-duplication rule in generateCloudimageURLs.
  return normalized.sort((a, b) => a - b);
};

/**
 * Nearest supported ratio greater than or equal to the device's own. Real devices
 * report values like 2.625 or 1.7647, none of which are in the supported list -
 * passing those through raw would miss the positional lookup in generate-url.js
 * and serve the full-size original.
 *
 * An empty list is the documented "no retina support" opt-out, so it snaps to 1
 * rather than falling back to the full supported list - otherwise backgrounds,
 * which have no srcset to opt out of, would still be fetched at up to 3x.
 *
 * @param {Number[]} dprList - normalized devicePixelRatioList
 * @return {Number} a ratio the URL generator can resolve
 */
const snapDevicePixelRatio = (dprList) => {
  if (!dprList || !dprList.length) return 1;

  const dpr = window.devicePixelRatio || 1;

  return dprList.find((value) => value >= dpr) || dprList[dprList.length - 1] || 1;
};

/**
 * Builds the 1x URL and the srcset candidates for one image or background.
 * Shared by every flavor - see src/<flavor>/ci.service.js#getBasicInfo.
 *
 * @param {Object} urlProps - everything generateURL needs except devicePixelRatio
 * @param {Number[]} devicePixelRatioList - normalized list of ratios
 * @return {Object} { generateURLbyDPR, cloudimageUrl, cloudimageSrcset }
 */
const generateCloudimageURLs = (urlProps, devicePixelRatioList) => {
  const generateURLbyDPR = (devicePixelRatio) => generateURL({ ...urlProps, devicePixelRatio });
  const cloudimageUrl = generateURLbyDPR(1);
  const cloudimageSrcset = [];

  (devicePixelRatioList || []).forEach((dpr) => {
    const url = generateURLbyDPR(dpr);
    const duplicate = cloudimageSrcset.find((candidate) => candidate.url === url);

    // limitFactor rounding collapses adjacent ratios onto the same width (a 30px
    // container rounds up to 50px for both 1x and 1.5x). Emit the URL once,
    // advertised at the highest density it covers, so the browser does not skip
    // to the next - larger - candidate for nothing. Relies on the list being
    // sorted ascending by normalizeDevicePixelRatioList.
    if (duplicate) {
      duplicate.dpr = dpr.toString();
    } else {
      cloudimageSrcset.push({ dpr: dpr.toString(), url });
    }
  });

  return { generateURLbyDPR, cloudimageUrl, cloudimageSrcset };
};

export {
  SUPPORTED_DEVICE_PIXEL_RATIO_LIST,
  normalizeDevicePixelRatioList,
  snapDevicePixelRatio,
  generateCloudimageURLs,
};
