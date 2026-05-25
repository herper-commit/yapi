/**
 * 备用 axios 实例（与主应用 apiClient 共用 YApi 响应契约）
 * 使用相对路径，勿使用 @ 别名
 */
import axios from "axios";
import { getToken, removeToken } from "../utils/auth";

const { ApiCode, isApiEnvelope, isSuccess } = require("common/apiResponse");

const service = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "/api"
      : process.env.VITE_BASE_URL || process.env.REACT_APP_BASE_URL || "/api",
  timeout: 1000 * 60
});

let httpList = [];
const removeHttp = (config) => {
  const index = httpList.findIndex((v) => v.url === config.url && v.method === config.method);
  if (index >= 0) {
    httpList[index].controller.abort();
    httpList.splice(index, 1);
  }
};

service.interceptors.request.use((config) => {
  removeHttp(config);
  const controller = new AbortController();
  config.signal = controller.signal;
  config.controller = controller;
  httpList.push({ ...config });
  if (getToken()) {
    config.headers["token"] = `${getToken()}`;
  }
  return config;
}, (error) => Promise.reject(error));

service.interceptors.response.use((response) => {
  const body = response.data;
  if (!isApiEnvelope(body)) {
    console.warn("[service] 非标准响应", response.config.url);
    return response;
  }
  if (body.errcode === ApiCode.NOT_LOGIN) {
    return response;
  }
  if (!isSuccess(body)) {
    const error = new Error(body.errmsg || "请求失败");
    error.errcode = body.errcode;
    return Promise.reject(error);
  }
  return response;
}, (error) => {
  if (error && error.response && error.response.status === 401) {
    removeToken();
  }
  return Promise.reject(error);
});

export default service;
