"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DeleteNav from "../_component/DeleteNav";
import DeleteInfo from "./_component/DeleteInfo";
import styles from "./delete.module.css";

export default function DeletePage() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleGoDelete = () => {
    router.push("/delete/deleteCheckInfo");
  };

  return (
    <div className={styles.deleteBox}>
      <DeleteNav />
      <DeleteInfo isChecked={isChecked} setIsChecked={setIsChecked} />
      <div className={styles.deleteBtnContainer}>
        <button
          className={`${styles.deleteCheckBtn} ${isChecked ? styles.checkedBtn : ""}`}
          disabled={!isChecked}
          onClick={handleGoDelete}
        >
          다음
        </button>
      </div>
    </div>
  );
}
