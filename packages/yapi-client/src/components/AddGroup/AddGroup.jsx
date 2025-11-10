import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
//
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
//
import { Button } from "antd";
import { PlusSquareOutlined } from "@ant-design/icons";
//
import {
  Box, Snackbar,
  Dialog, DialogActions,
  DialogContent,
  DialogTitle, FormControl,
  IconButton,
  TextField, Zoom
} from "@mui/material";
import { Close } from "@mui/icons-material";
import request from "@/service/request.js";
//
import UserAutoComplete from "@/components/UserAutoComplete/UserAutoComplete.jsx";
//
import { fetchGroupList, fetchGroupMsg } from "@/store/slices/group.js";
import { fetchNewsData } from "@/store/slices/news.js";
//
// 动画
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});
const schema = yup.object().shape({
  group_name: yup.string().required("请输入分组名称"),
  group_desc: yup.string().required("请输入分组描述"),
  owner_uids: yup.array().min(1, "请选择分组所有者"),
});
//
function AddGroupModal(props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  //
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  //
  const dispatch = useDispatch();
  //
  const formik = useFormik({
    initialValues: {
      "group_name": "", // 项目名称
      "group_desc": "", // 所属分组
      "owner_uids": [], // 基本路径
    },
    validationSchema: schema,
    onSubmit: async(values) => {
      try {
        // 在这里处理表单提交逻辑
        console.log(`提交表单：${JSON.stringify(values, null, 2)}`);
        const res = await addGroup(values);
        console.log("1111111111", res);
        formik.resetForm();
        setMessage("创建成功");
        setOpenSnackbar(true);
        setOpen(false);
        navigate({ pathname: "/group/" + res.data.data._id });
      } catch (e) {
        console.error(e);
        setMessage(e.data.errmsg);
        setOpenSnackbar(true);
      }
    },
  });
  //
  const addGroup = async(values) => {
    try {
      const res = await request.post("/group/add", { ...values });
      if (!res.data.errcode) {
        await dispatch(fetchGroupList());
        await fetchGroupMsg(res.data.data._id);
        await fetchNewsData(res.data.data._id, "group", 1, 10);
        return res
      } else {
        return Promise.reject(res);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }
  //
  const handleClickOpen = async() => {
    setMessage("创建成功");
    setOpenSnackbar(true);
    setOpen(true);
  };
  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
  };
  //
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  //
  const action = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
        <Close fontSize="small"/>
      </IconButton>
    </React.Fragment>
  );
  //
  return (
    <>
      {
        props.type === "icon"
          ? <Button style={{ marginLeft: "10px", width: "32px" }} type="primary" shape="default"
            icon={<PlusSquareOutlined/>}
            onClick={handleClickOpen}/>
          : <Button type={props.type} title={props.title} color="primary" onClick={handleClickOpen}>
            创建分组
          </Button>
      }
      {/*  */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose} message={message} action={action}/>
      {/*  */}
      <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose}>
        <Box sx={{ minWidth: 120 }} component={"form"}>
          <DialogTitle align={"center"}>创建分组</DialogTitle>
          {/*  */}
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ m: 3, mb: 0 }}>
              <TextField sx={{ mb: 2 }} fullWidth label="分组名称" placeholder={"请输入分组名称"} name={"group_name"} value={formik.values.group_name}
                error={Boolean(formik.touched.group_name && formik.errors.group_name)}
                helperText={formik.touched.group_name && formik.errors.group_name}
                onChange={formik.handleChange}/>
              {/*  */}
              <TextField sx={{ mb: 2 }} fullWidth label="分组描述" placeholder={"分组描述不超过144字"} name={"group_desc"} multiline rows={3} value={formik.values.group_desc}
                error={Boolean(formik.touched.group_desc && formik.errors.group_desc)}
                helperText={formik.touched.group_desc && formik.errors.group_desc}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}/>
              {/*  */}
              <FormControl sx={{ mb: 2 }} fullWidth error={Boolean(formik.touched.owner_uids && formik.errors.owner_uids)}>
                <UserAutoComplete label="分组所属人员" placeholder={"请选择项目分组所属人员"} name={"owner_uids"} value={formik.values.owner_uids}
                  onChange={(event, newValue) => {
                    formik.setFieldValue("owner_uids", newValue);
                  }}/>
                {formik.touched.owner_uids && formik.errors.owner_uids && (
                  <Box sx={{ color: "red", fontSize: 12 }}>{formik.errors.owner_uids}</Box>
                )}
              </FormControl>
            </Box>
          </DialogContent>
          {/*  */}
          <DialogActions>
            <Box sx={{ margin: "0 15px" }}>
              <Button type="button" onClick={handleClose}>取消</Button>
              <Button onClick={formik.handleSubmit} type={"submit"} color="primary">创建</Button>
            </Box>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  )
}
export default AddGroupModal;
