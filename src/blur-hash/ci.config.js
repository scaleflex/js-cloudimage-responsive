import { getParams } from '../common/ci.utils';
import { CONSTANTS } from 'cloudimage-responsive-utils';


export const getInitialConfigBlurHash = (config) => {
  const {
    token = '',
    domain = 'cloudimg.io',
    lazyLoading = false,
    baseUrl,
    baseURL,
    presets,
    ratio = 1.5,
    params = 'org_if_sml=1',
    init = true,
    exactSize = false,
    doNotReplaceURL = false,
    limitFactor = 100,
    devicePixelRatioList,      // TODO: add to readme
    ignoreNodeImgSize = false,
    ignoreStyleImgSize = false,
    destroyNodeImgSize = false,
    saveNodeImgRatio = false,
    detectImageNodeCSS = false,
    processOnlyWidth = false,

    // callbacks
    onImageLoad
  } = config;

  return {
    token,
    domain,
    lazyLoading,
    baseURL: baseUrl || baseURL,
    ratio,
    exactSize,
    presets: presets ? presets :
      {
        xs: '(max-width: 575px)',  // to 575       PHONE
        sm: '(min-width: 576px)',  // 576 - 767    PHABLET
        md: '(min-width: 768px)',  // 768 - 991    TABLET
        lg: '(min-width: 992px)',  // 992 - 1199   SMALL_LAPTOP_SCREEN
        xl: '(min-width: 1200px)'  // from 1200    USUALSCREEN
      },
    params: getParams(params),
    innerWidth: typeof window !== 'undefined' ? window.innerWidth : null,
    init,
    previewQualityFactor: 10,
    doNotReplaceURL,
    devicePixelRatioList: devicePixelRatioList || CONSTANTS.DEVICE_PIXEL_RATIO_LIST,
    limitFactor,
    ignoreNodeImgSize,
    ignoreStyleImgSize,
    destroyNodeImgSize,
    saveNodeImgRatio,
    detectImageNodeCSS,
    processOnlyWidth,

    onImageLoad
  };
};