import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Meta, StoryObj } from '@storybook/react';
import { AppBar, Button, ListRow, Sheet, TabBar } from '../components/core';
import { color, space } from '@industry/tokens';

const meta: Meta = {
  title: 'Templates/List + Detail',
  parameters: { gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj;

const PROJECTS = [
  { id: '1', name: 'Rebranding', meta: 'Em andamento' },
  { id: '2', name: 'App Ticketing', meta: 'Em revisão' },
  { id: '3', name: 'AppointMate', meta: 'Concluído' },
];

function ListDetailScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('projects');
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = PROJECTS.find((p) => p.id === openId);

  return (
    <View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
      <AppBar title="Projetos" />
      <View style={{ flex: 1, gap: space[2], padding: space[4] }}>
        {PROJECTS.map((project) => (
          <ListRow
            key={project.id}
            title={project.name}
            meta={project.meta}
            onPress={() => setOpenId(project.id)}
          />
        ))}
      </View>
      <TabBar
        items={[
          { id: 'projects', label: 'Projetos' },
          { id: 'settings', label: 'Configurações' },
        ]}
        current={tab}
        onSelect={setTab}
      />
      <Sheet
        open={selected !== undefined}
        title={selected?.name}
        onDismiss={() => setOpenId(null)}
        actions={
          <Button variant="primary" block onPress={() => setOpenId(null)}>
            Fechar
          </Button>
        }
      >
        <View style={{ paddingHorizontal: space[4], paddingBottom: space[4] }}>
          <ListRow title="Status" meta={selected?.meta} />
        </View>
      </Sheet>
    </View>
  );
}

export const Default: Story = {
  render: () => <ListDetailScreen />,
};
