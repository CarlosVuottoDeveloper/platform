import { Text, View } from 'react-native';
import { Button, EmptyState, Icon } from '@industry/mobile';
import { fontFamily, fontSize, semanticColor, space } from '@industry/tokens';

export interface ErrorViewProps {
  description: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function ErrorView({
  description,
  title,
  actionLabel = 'Tentar novamente',
  onAction,
  testID,
}: ErrorViewProps) {
  return (
    <View testID={testID} style={{ flex: 1, justifyContent: 'center', padding: space[6] }}>
      <EmptyState
        icon={<Icon name="CircleAlert" size="lg" color={semanticColor.danger} />}
        title={title}
        body={
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: fontSize.body,
              color: semanticColor.danger,
              textAlign: 'center',
            }}
          >
            {description}
          </Text>
        }
        action={
          onAction ? (
            <Button variant="secondary" onPress={onAction}>
              {actionLabel}
            </Button>
          ) : undefined
        }
      />
    </View>
  );
}
