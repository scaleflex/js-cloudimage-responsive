import { DEVICE_PIXEL_RATIO_LIST } from 'cloudimage-responsive-utils/dist/constants';
import { getParams } from '../common/ci.utils';


export const getInitialConfigLowPreview = (config) => {
  const {
    imgSelector = 'ci-src',
    bgSelector = 'ci-bg-url',
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
    apiVersion = null,
    init = true,
    exactSize = false,
    doNotReplaceURL = false,
    limitFactor = 100,
    ignoreNodeImgSize,
    imageSizeAttributes = 'use',
    ignoreStyleImgSize = false,
    destroyNodeImgSize = false,
    saveNodeImgRatio = false,
    detectImageNodeCSS = false,
    customDomain = false,
    processOnlyWidth = false,
    devicePixelRatioList = DEVICE_PIXEL_RATIO_LIST,
    lowQualityPreview: {
      minImgWidth = 400,
    } = {},

    // callback
    onImageLoad = null,
  } = config;

  return {
    imgSelector,
    bgSelector,
    token,
    domain,
    lazyLoading,
    imgLoadingAnimation,
    placeholderBackground,
    baseURL: baseUrl || baseURL,
    ratio,
    exactSize,
    presets: presets || {
      xs: '(max-width: 575px)', // to 575       PHONE
      sm: '(min-width: 576px)', // 576 - 767    PHABLET
      md: '(min-width: 768px)', // 768 - 991    TABLET
      lg: '(min-width: 992px)', // 992 - 1199   SMALL_LAPTOP_SCREEN
      xl: '(min-width: 1200px)', // from 1200    USUALSCREEN
    },
    params: getParams(params),
    apiVersion,
    customDomain,
    innerWidth: window.innerWidth,
    init,
    previewQualityFactor: 10,
    doNotReplaceURL,
    devicePixelRatioList,
    limitFactor,
    minLowQualityWidth: minImgWidth,
    ignoreNodeImgSize,
    ignoreStyleImgSize,
    imageSizeAttributes,
    destroyNodeImgSize,
    saveNodeImgRatio,
    detectImageNodeCSS,
    processOnlyWidth,
    onImageLoad,
    // isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  };
};
