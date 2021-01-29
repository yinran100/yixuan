// TODO 请慎用 NODE_ENV 环境变量，这个环境变量会被webpack操作进行覆盖
const { COPY_CDN, SCRIPT_ENV } = process.env;

/**
 * 注意: 以下内容仅是演示, 用该脚手架构建出来的具体业务, 需要重新添加具体的url地址, SCRIPT_ENV可针对不同需要重新填写
 * @override
 */
module.exports = [
  {
    enable: !!COPY_CDN,
    name: 'webcdn.inke.cn',
    url: 'https://deploy.inkept.cn/templates/deploy.html?job_name=cop.inke_owt.bpc_pdl.staticresources_servicegroup.static_service.resources_job.resources_cluster.ali-bj'
  },
  {
    enable: SCRIPT_ENV === 'gray',
    name: 'betah5.inke.cn',
    url: 'https://deploy.inkept.cn/templates/deploy.html?job_name=cop.inke_owt.bpc_pdl.web_servicegroup.busi_service.h5-inke-cn-gray_job.h5-inke-cn-gray_cluster.ali-gray'
  },
  {
    enable: SCRIPT_ENV === 'test',
    name: 'testh5.inke.cn',
    url: 'https://deploy.inkept.cn/templates/deploy.html?job_name=cop.inke_owt.bpc_pdl.opd_servicegroup.opd_service.activitys_job.h5_cluster.ali-test'
  },
];
