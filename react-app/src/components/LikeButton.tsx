import { useState } from 'react';
import { Button, Text, Tooltip } from '@fluentui/react-components';
import { Heart24Regular, Heart24Filled } from '@fluentui/react-icons'; // 需要安装 icons 包
import { motion } from 'framer-motion';

// 接收 Hugo 传来的 postId
interface LikeButtonProps {
  postId?: string;
}

export const LikeButton = ({ postId }: LikeButtonProps) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(128); // 模拟数据

  const handleLike = () => {
    // 这里可以调用 Firebase
    // import { getDatabase, ref, ... } from 'firebase/database';
    setLiked(!liked);
    setCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 0' }}>
      <Tooltip content={liked ? "Unlike" : "Like"} relationship="label">
        <motion.div whileTap={{ scale: 0.8 }}>
          <Button
            icon={liked ? <Heart24Filled color="#c50f1f" /> : <Heart24Regular />}
            onClick={handleLike}
            appearance="subtle"
          >
            {liked ? "Liked" : "Like"}
          </Button>
        </motion.div>
      </Tooltip>
      <Text weight="semibold">{count} likes</Text>
      <Text size={200} style={{ color: '#888' }}> (Post ID: {postId})</Text>
    </div>
  );
};