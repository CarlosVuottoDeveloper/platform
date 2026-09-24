import { View } from 'react-native';
import { IconButton, TextField } from '@industry/mobile';
import { styles } from './CommentInput.styles';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  onFocus?: () => void;
}

export function CommentInput({ value, onChangeText, onSubmit, disabled, onFocus }: Props) {
  return (
    <View style={styles.row}>
      <TextField
        style={styles.input}
        placeholder="Escrever um comentário"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        returnKeyType="send"
        onSubmitEditing={disabled ? undefined : onSubmit}
      />
      <IconButton
        icon="ArrowRight"
        variant="solid"
        label="Enviar comentário"
        onPress={onSubmit}
        disabled={disabled}
      />
    </View>
  );
}
