import { CommonButton } from "./CommonButton";
import styleStorage from "../css/Storage.module.css"

export default function StorageModifyButton({ text = "수정" }) {
  return (
    <div className={styleStorage.btnSubmitWrap}>
      <CommonButton variant="primary" type="submit">
        {text}
      </CommonButton>
    </div>
  );
}
