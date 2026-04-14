import React from "react";
import { useFriendStore } from "../store/useFriendStore";

export const ContactManager: React.FC = () => {
  const { friends } = useFriendStore();

  return (
    <div
      style={{
        padding: "20px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "white",
      }}
    >
      <div
        style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "bold" }}
      >
        通讯录管理
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              borderBottom: "1px solid #eee",
              textAlign: "left",
              color: "#999",
            }}
          >
            <th style={{ padding: "10px" }}>
              <input type="checkbox" />
            </th>
            <th>昵称</th>
            <th>备注</th>
            <th>标签</th>
            <th>朋友权限</th>
          </tr>
        </thead>
        <tbody>
          {friends.map((f) => (
            <tr key={f.userId} style={{ borderBottom: "1px solid #f9f9f9" }}>
              <td style={{ padding: "10px" }}>
                <input type="checkbox" />
              </td>
              <td
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 0",
                }}
              >
                <img
                  src={f.avatar}
                  style={{
                    width: 30,
                    height: 30,
                    marginRight: 10,
                    borderRadius: "4px",
                  }}
                />
                {f.username}
              </td>
              <td>{f.remark || "-"}</td>
              <td>{f.labelName}</td>
              <td>聊天、朋友圈、微信运动等</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
