import { motion } from 'framer-motion';

// 코드의 의미: 삭제 버튼 애니메이션 컴포넌트
// 왜 사용했는지: 삭제 버튼에 애니메이션 효과를 적용
function DeleteButtonMotion({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="text-destructive hover:text-destructive/40"
      type="button"
    >
      {children}
    </motion.button>
  );
}

export default DeleteButtonMotion;
