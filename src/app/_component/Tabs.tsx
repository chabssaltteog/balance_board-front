"use client";

import React, { useState } from "react";

import styles from "./tabs.module.css";

interface IProfileProps {
  totalCount: number;
  votedCount: number;
  writtenCount: number;
}

function Maintab() {
  const tabs: string[] = ["전체", "이슈", "라이프", "정치・경제", "기타"];
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className={styles.tabsMenuContainer}>
      {tabs.map((tab, index) => (
        <div
          key={index}
          className={`${styles.tab} ${index === activeTab ? styles.active : ""}`}
          onClick={() => setActiveTab(index)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}

function Profiletab({ totalCount, votedCount, writtenCount }: IProfileProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    { label: "전체", count: totalCount },
    { label: "투표한 글", count: votedCount },
    { label: "작성한 글", count: writtenCount },
  ];

  return (
    <div className={styles.tabsProfileContainer}>
      <div className={styles.tabsContainer}>
        {tabs.map((profileTab, index) => (
          <div
            key={index}
            className={`${styles.profileTab} ${activeTab === index ? styles.active : ""}`}
            onClick={() => setActiveTab(index)}
          >
            <div className={styles.tabContent}>
              <div className={styles.tabLabel}>{profileTab.label}</div>
              <div className={styles.tabCount}>{profileTab.count}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={`${styles.tabProfileBorderBottom} ${activeTab !== undefined ? styles.active : ""}`}></div>
    </div>
  );
}

export { Maintab, Profiletab };
