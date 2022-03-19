window.ciResponsive = new window.CIResponsive({
  token: "scaleflex",
  baseURL: "https://scaleflex.cloudimg.io/v7/demo/cloudimage-responsive-demo/",
  params: 'org_if_sml=1&version=16.04.2020',
  lazyLoadOffset: 100,
  apiVersion: 'v7',
  lazyLoading: true,
  exactSize: false,
  limitFactor: 10,

  // processURL: (props) => {
  //   console.log(props)
  //
  //   return props.url;
  // },
  // props: {
  //   query,
  //   widthQ,
  //   heightQ,
  //   restParamsQ,
  //   processOnlyWidth,
  //   devicePixelRatio,
  //   service: {
  //     methods: {},
  //     props: {
  //       imgNode,
  //       imgProps,
  //       config
  //     }
  //   }
  // }
  // processQueryString: (props) => {
  //   var imgNode = props.service.props.imgNode;
  //   var maxWidth = imgNode.getAttribute('max-width');
  //   var maxHeight = imgNode.getAttribute('max-height');
  //
  //   if (maxWidth && maxHeight) {
  //     return [
  //       `${props.restParamsQ}`,
  //       `&w=${maxWidth * props.devicePixelRatio}&h=${maxHeight * props.devicePixelRatio}&func=fit`
  //     ].join('');
  //   } else {
  //     return props.query;
  //   }
  // }

  // imgSelector: 'data-src',
  // bgSelector: 'data-bg-src'

  //ignoreNodeImgSize: false,
  //saveNodeImgRatio: false,
  //ignoreStyleImgSize: false,
  //destroyNodeImgSize: false,
  //detectImageNodeCSS: false,
  //processOnlyWidth: false,
  //
  //onImageLoad: function (image) {
  //  console.log(image.width, image.height);
  //}
});

window.lazySizes.init();
