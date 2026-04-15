import React from "react";
import { useFriendStore } from "../store/useFriendStore";
import styles from "./ContactManager.module.css";

export const ContactManager: React.FC = () => {
  const { friends } = useFriendStore();

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>通讯录管理</h2>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th><input type="checkbox" className={styles.checkbox} /></th>
            <th>昵称</th>
            <th>备注</th>
            <th>标签</th>
            <th>朋友权限</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {friends.map((f) => (
            <tr key={f.userId}>
              <td>
                <input type="checkbox" className={styles.checkbox} />
              </td>
              <td>
                <div className={styles.nameCell}>
                  <div className={styles.avatarWrap}>
                    <span className={styles.avatarGlow} aria-hidden />
                    <img src={f.avatar} className={styles.avatar} alt="avatar" />
                  </div>
                  {f.username}
                </div>
              </td>
              <td>{f.remark || <span className={styles.dimText}>—</span>}</td>
              <td>{f.labelName || <span className={styles.dimText}>—</span>}</td>
              <td className={styles.dimText}>聊天、朋友圈、微信运动等</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
