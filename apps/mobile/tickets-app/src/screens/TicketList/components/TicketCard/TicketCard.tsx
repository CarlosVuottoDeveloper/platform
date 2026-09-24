import { Pressable, Text, View } from 'react-native';
import { Badge, Card, useTheme } from '@industry/mobile';
import { alpha, space } from '@industry/tokens';
import { formatDateLong, truncateTitle } from '../../../../domain/ticket';
import {
  PRIORITY_LABELS,
  PRIORITY_TONES,
  isPriorityMaximum,
  type TicketPriority,
} from '../../../../constants/ticketPriority';
import { styles } from './TicketCard.styles';

interface Props {
  title: string;
  priority: TicketPriority;
  creatorName: string;
  createdAt: Date | null;
  assigneeName?: string | null;
  onPress: () => void;
}

export function TicketCard({
  title,
  priority,
  creatorName,
  createdAt,
  assigneeName,
  onPress,
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress}>
      <Card framed style={{ gap: space[1] }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{truncateTitle(title)}</Text>
          <Badge tone={PRIORITY_TONES[priority]} solid={isPriorityMaximum(priority)}>
            {PRIORITY_LABELS[priority]}
          </Badge>
        </View>
        <Text style={[styles.meta, { color: alpha(colors.text, 50) }]}>
          Aberto por {creatorName}
          {createdAt ? ` · ${formatDateLong(createdAt)}` : ''}
        </Text>
        <Text style={[styles.meta, { color: alpha(colors.text, 50) }]}>
          Responsável: {assigneeName ?? 'não designado'}
        </Text>
      </Card>
    </Pressable>
  );
}
