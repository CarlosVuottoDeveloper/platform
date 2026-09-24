import { Platform, View, Text } from 'react-native';
import { Button, useTheme } from '@industry/mobile';
import { alpha, fontFamilyMono } from '@industry/tokens';
import { formatDateTimeShort } from '../../../../domain/ticket';
import type { Comment } from '../../../../domain/ticket';
import { styles } from './CommentItem.styles';

const monoFontFamily = Platform.select(fontFamilyMono);

interface Props {
  comment: Comment;
  canDelete: boolean;
  onDeletePress: () => void;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;
  return `${first.charAt(0)}${last?.charAt(0) ?? ''}`.toUpperCase();
}

export function CommentItem({ comment, canDelete, onDeletePress }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.commentRow}>
      <View
        style={[styles.avatar, { backgroundColor: colors.surface2, borderColor: colors.divider }]}
      >
        <Text style={[styles.avatarText, { color: alpha(colors.text, 70) }]}>
          {initialsOf(comment.authorName)}
        </Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.authorName}</Text>
          <Text
            style={[
              styles.commentDate,
              { fontFamily: monoFontFamily, color: alpha(colors.text, 45) },
            ]}
          >
            {formatDateTimeShort(comment.createdAt)}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: alpha(colors.text, 78) }]}>{comment.text}</Text>
        {canDelete && (
          <Button style={styles.deleteButton} variant="ghost" onPress={onDeletePress}>
            Apagar
          </Button>
        )}
      </View>
    </View>
  );
}
