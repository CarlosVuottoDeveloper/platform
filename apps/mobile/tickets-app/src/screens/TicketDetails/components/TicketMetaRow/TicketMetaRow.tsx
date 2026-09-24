import { View, Text } from 'react-native';
import { useTheme } from '@industry/mobile';
import { alpha } from '@industry/tokens';
import { formatDateLong } from '../../../../domain/ticket';
import { styles } from './TicketMetaRow.styles';

interface Props {
  creatorName: string;
  createdAt: Date | null;
  assigneeName: string | null;
}

function MetaCell({
  label,
  value,
  labelColor,
  valueColor,
  bg,
}: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
  bg: string;
}) {
  return (
    <View style={[styles.cell, { backgroundColor: bg }]}>
      <Text style={[styles.cellLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.cellValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export function TicketMetaRow({ creatorName, createdAt, assigneeName }: Props) {
  const { colors } = useTheme();
  const labelColor = alpha(colors.text, 50);
  const valueColor = colors.text;
  const bg = colors.bg;

  return (
    <View style={[styles.grid, { backgroundColor: colors.divider }]}>
      <View style={styles.row}>
        <MetaCell
          label="Criador"
          value={creatorName}
          labelColor={labelColor}
          valueColor={valueColor}
          bg={bg}
        />
        {createdAt && (
          <MetaCell
            label="Abertura"
            value={formatDateLong(createdAt)}
            labelColor={labelColor}
            valueColor={valueColor}
            bg={bg}
          />
        )}
      </View>
      <View style={styles.row}>
        <MetaCell
          label="Responsável"
          value={assigneeName ?? 'não designado'}
          labelColor={labelColor}
          valueColor={valueColor}
          bg={bg}
        />
      </View>
    </View>
  );
}
