import { CommonButton } from "./CommonButton";
import styleStorage from "../css/Storage.module.css"

export default function StorageModifyButton({ text = "수정", isPending }) {
  return (
    <div className={styleStorage.btnSubmitWrap}>
      <CommonButton variant="primary" type="submit" disabled={isPending}>
        {text}
      </CommonButton>
    </div>
  );
}
