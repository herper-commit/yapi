"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Divider, Empty, Flex, Input, Spin, Tooltip, List, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const ListItem = List.Item;
const TypographyText = Typography.Text;
//
import AddGroup from "@/components/AddGroup/AddGroup.jsx";
//
import { useAppSelector } from "@/store/hooks";
import { fetchNewsData } from "@/store/slices/news.js";
import { fetchGroupList, setCurrGroup, fetchGroupMsg } from "@/store/slices/group.js";
//
import styles from "./GroupList.module.scss";
// const tip = (
//   <div className="title-container">
//     <h3 className="title">欢迎使用 YApi ~</h3>
//     <p>
//       这里的 <b>“个人空间”</b>{" "}
//       是你自己才能看到的分组，你拥有这个分组的全部权限，可以在这个分组里探索 YApi 的功能。
//     </p>
//   </div>
// );
//
export default function GroupList(props) {
  const groupState = useAppSelector((state) => state.group);
  const { groupList } = groupState;
  //
  const navigate = useRouter();
  const { groupId: paramsGroupId } = useParams();
  //
  const [groupId, setGroupId] = useState(() => !isNaN(groupId) ? parseInt(groupId) : 0);
  const [searchGroupList, setSearchGroupList] = useState(groupList);
  //
  useEffect(() => {
    setSearchGroupList(() => groupList);
  }, [groupList]);
  //
  const onLoad = async() => {
    console.debug("GroupList.jsx onLoad: ", props);
    console.debug("GroupList.jsx onLoad: ", paramsGroupId);
    //
    const req = await fetchGroupList();
    console.warn("GroupList.jsx fetchGroupList: ", req, groupList, groupId, !!groupId);
    if (groupId) {
      const _currGroup = groupList.find((e) => e._id === groupId);
      if (_currGroup) {
        setCurrGroup(_currGroup);
      }
    } else {
      // 没有id
      if (groupList.length > 0) {
        setGroupId(groupList[0]._id);
        setCurrGroup(groupList[0]);
        navigate.push(`/group/${groupList[0]._id}`);
      }
    }
  }
  //
  useEffect(() => {
    void onLoad();
  }, []);
  //
  const selectGroup = async(e) => {
    console.warn("GroupList.jsx selectGroup: ", e);
    const groupId = e.key;
    setGroupId(e.key);
    const currGroup = groupList.find((group) => group._id === groupId);
    if (currGroup) {
      setCurrGroup(currGroup);
      await fetchNewsData(groupId, "group", 1, 10);
      navigate.push(`${currGroup._id}`, { replace: true });
    }
  }
  //
  const searchGroup = (value, e) => {
    console.log(e);
    const v = value || e.target.value;
    console.log(v);
    if (v === "") {
      setSearchGroupList(groupList);
    } else {
      setSearchGroupList(() => groupList.filter((group) => new RegExp(v, "i").test(group.group_name)));
    }
  }
  //
  return (
    <div className={styles.GroupList}>
      {/* {!study ? <div className="study-mask"/> : null} */}
      {/* <Box className="curr-group">
          <Box component={"h3"} className="curr-group-name name">{currGroup.group_name}</Box>
          <Box component={"pre"} className="curr-group-desc">简介: {currGroup.group_desc}</Box>
        </Box> */}
      {/* <div className="group-operate">
          <div className="search">
            <Input.Search placeholder="搜索分类" onChange={(e) => searchGroup(e)} onSearch={(v) => searchGroup(null, v)}/>
          </div>
        </div> */}
      <div style={{ padding: "10px" }}>
        <Flex>
          <Input style={{ flex: 1 }} placeholder="搜索分类" allowClear onChange={(e) => searchGroup(e.target.value, e)} suffix={<SearchOutlined/>}/>
          <Tooltip title="添加分组">
            <AddGroup aria-label="添加分组" title={"添加分组"} type={"icon"}/>
          </Tooltip>
        </Flex>
      </div>
      <Divider style={{ margin: "0px" }}/>
      {/*  */}
      {groupList.length === 0 ? <Spin style={{ marginTop: 20, display: "flex", justifyContent: "center" }}/> : null}
      {/*  */}
      <div className="group-list">
        {
          groupList.length === 0
            ? <Empty/>
            /* : <List>
              {
                searchGroupList.map((item, index) => (
                  <ListItemButton
                    key={index}
                    onClick={(event) => selectGroup({ ...item, key: item._id })}
                    selected={groupId === item._id}>
                    <ListItemAvatar>
                      <Avatar alt={item.group_name} src="/static/images/avatar/1.jpg"/>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{ m: 0 }}
                      primary={item.group_name}
                      secondary={
                        <React.Fragment>
                          <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                            简介：
                          </Typography>
                          {item.group_desc}
                        </React.Fragment>
                      }
                    />
                  </ListItemButton>
                ))
              }
            </List> */
            : <List
              header={<div>Header</div>}
              footer={<div>Footer</div>}
              bordered
              dataSource={searchGroupList}
              renderItem={(item: any) => (
                <ListItem>
                  <TypographyText mark>[ITEM]</TypographyText> {item.group_name}
                </ListItem>
              )}
            />
        }
      </div>
    </div>
  )
}
