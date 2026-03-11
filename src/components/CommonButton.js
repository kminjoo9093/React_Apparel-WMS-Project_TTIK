import BtnStyle from "../css/Buttons.module.css";

export const CommonButton = ({as: Component="button", variant, children, ...props}) => {

  const variants = {
    primary: BtnStyle.primaryButton,
    secondary: BtnStyle.secondaryButton
  }

  //기본값 세팅
  const className = variants[variant] || variants.secondary;

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}