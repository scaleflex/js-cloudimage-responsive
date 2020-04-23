import { getParams } from '../common/ci.utils';
import { DEVICE_PIXEL_RATIO_LIST } from 'cloudimage-responsive-utils/dist/constants';


export const getInitialConfigLowPreview = (config) => {
  const {
    token = '',
    domain = 'cloudimg.io',
    lazyLoading = false,
    imgLoadingAnimation = true,
    placeholderBackground = '#f4f4f4',
    baseUrl, // to support old name
    baseURL,
    ratio,
    presets,
    params = 'org_if_sml=1',
    init = true,
    exactSize = false,
    doNotReplaceURL = false,
    limitFactor = 100,
    ignoreNodeImgSize = false,
    ignoreStyleImgSize = false,
    destroyNodeImgSize = false,
    saveNodeImgRatio = false,
    detectImageNodeCSS = false,
    processOnlyWidth = false,
    lowQualityPreview: { //TODO: add to readme
      minImgWidth = 400
    } = {},

    // callback
    onImageLoad = null
  } = config;

  return {
    token,
    domain,
    lazyLoading,
    imgLoadingAnimation,
    placeholderBackground,
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
    innerWidth: window.innerWidth,
    init,
    previewQualityFactor: 10,
    doNotReplaceURL,
    devicePixelRatioList: DEVICE_PIXEL_RATIO_LIST,
    limitFactor,
    minLowQualityWidth: minImgWidth,
    ignoreNodeImgSize,
    ignoreStyleImgSize,
    destroyNodeImgSize,
    saveNodeImgRatio,
    detectImageNodeCSS,
    processOnlyWidth,
    onImageLoad
    //isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  };
};