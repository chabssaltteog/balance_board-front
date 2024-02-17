"use client";

import React, { useState } from "react";

import styles from "./tabs.module.css";

const Tabs: React.FC = () => {
  const tabs: string[] = ["전체", "이슈", "라이프", "정치・경제", "기타"];
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className={styles.tabsContainer}>
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
};

export default Tabs;
