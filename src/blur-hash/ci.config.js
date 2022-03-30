import { getParams } from '../common/ci.utils';
import { DEVICE_PIXEL_RATIO_LIST } from 'cloudimage-responsive-utils/dist/constants';


export const getInitialConfigBlurHash = (config) => {
  const {
    imgSelector = 'ci-src',
    bgSelector = 'ci-bg-url',
    token = '',
    domain = 'cloudimg.io',
    lazyLoading = false,
    baseUrl,
    baseURL,
    presets,
    ratio = 1.5,
    params = 'org_if_sml=1',
    apiVersion = 'v7',
    customDomain = false,
    init = true,
    exactSize = false,
    doNotReplaceURL = false,
    limitFactor = 100,
    devicePixelRatioList = DEVICE_PIXEL_RATIO_LIST,
    ignoreNodeImgSize,
    imageSizeAttributes = 'use',
    ignoreStyleImgSize = false,
    destroyNodeImgSize = false,
    saveNodeImgRatio = false,
    detectImageNodeCSS = false,
    processOnlyWidth = false,

    // callbacks
    onImageLoad
  } = config;

  return {
    imgSelector,
    bgSelector,
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
    apiVersion,
    customDomain,
    innerWidth: typeof window !== 'undefined' ? window.innerWidth : null,
    init,
    previewQualityFactor: 10,
    doNotReplaceURL,
    devicePixelRatioList,
    limitFactor,
    ignoreNodeImgSize,
    ignoreStyleImgSize,
    destroyNodeImgSize,
    saveNodeImgRatio,
    detectImageNodeCSS,
    processOnlyWidth,
    imageSizeAttributes,
    onImageLoad
  };
};
