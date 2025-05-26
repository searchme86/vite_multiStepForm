import { motion } from 'framer-motion';

// 코드의 의미: 직업 항목 애니메이션 컴포넌트
// 왜 사용했는지: 직업 항목에 애니메이션 효과를 적용
function JobItemMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      className="bg-neutral-800 p-4 rounded-lg space-y-3"
    >
      {children}
    </motion.div>
  );
}

export default JobItemMotion;
