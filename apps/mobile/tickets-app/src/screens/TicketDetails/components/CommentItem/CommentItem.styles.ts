import { StyleSheet } from 'react-native';
import { fontSize, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  commentRow: { flexDirection: 'row', gap: space[3] },
  avatar: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '600' },
  commentBody: { flex: 1, gap: space[1] },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentAuthor: { fontSize: 14, fontWeight: '500' },
  commentDate: { fontSize: 10 },
  commentText: { fontSize: fontSize.body },
  deleteButton: { alignSelf: 'flex-start', borderWidth: 0 },
});
