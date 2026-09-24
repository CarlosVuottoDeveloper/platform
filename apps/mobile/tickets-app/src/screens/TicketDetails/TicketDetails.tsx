import { useEffect, useMemo, useRef } from 'react';
import { Platform, View, Text, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppBar,
  Badge,
  Button,
  Select,
  Sheet,
  Spinner,
  useTheme,
  useToast,
  type AppBarAction,
} from '@industry/mobile';
import { accentRamp, alpha, fontFamilyMono } from '@industry/tokens';
import { useTicketDetails } from '../../hooks/useTicketDetails';
import { useUserList } from '../../hooks/useUserList';
import { useAuthStore } from '../../store/useAuthStore';
import { ALL_STATUSES, STATUS_LABELS, STATUS_TONES } from '../../constants/ticketStatus';
import {
  ALL_PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  isPriorityMaximum,
} from '../../constants/ticketPriority';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { useTicketEditMode } from './hooks/useTicketEditMode';
import { useCommentForm } from './hooks/useCommentForm';
import { useTicketDeletion } from './hooks/useTicketDeletion';
import { useCommentDeletion } from './hooks/useCommentDeletion';
import { TicketMetaRow } from './components/TicketMetaRow';
import { TicketOptionField } from './components/TicketOptionField';
import { CommentItem } from './components/CommentItem';
import { CommentInput } from './components/CommentInput';
import { styles } from './TicketDetails.styles';

const monoFontFamily = Platform.select(fontFamilyMono);
const UNASSIGNED_LABEL = 'não designado';

function SectionLabel({ children, trailing }: { children: string; trailing?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={[styles.sectionLabel, { color: accentRamp['300'] }]}>{children}</Text>
      {trailing ? (
        <Text
          style={[
            styles.sectionLabelCount,
            { fontFamily: monoFontFamily, color: alpha(colors.text, 50) },
          ]}
        >
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}

function DiffRow({ label, from, to }: { label: string; from: string; to: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.diffRow, { borderBottomColor: colors.divider }]}>
      <Text style={[styles.diffLabel, { color: alpha(colors.text, 50) }]}>{label}</Text>
      <Text style={[styles.diffValue, { color: colors.text }]}>
        {from} → {to}
      </Text>
    </View>
  );
}

type Props = NativeStackScreenProps<AppStackParamList, 'TicketDetails'>;

export function TicketDetails({ route, navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const { ticketId } = route.params;
  const user = useAuthStore((s) => s.user);
  const { ticket, comments, loading, error, clearError, addComment, deleteComment } =
    useTicketDetails(ticketId);
  const { users } = useUserList();

  const editMode = useTicketEditMode({
    ticketId,
    users,
    ticket,
  });
  const commentForm = useCommentForm({ addComment });
  const deletion = useTicketDeletion({ ticketId, navigation });
  const commentDeletion = useCommentDeletion({ deleteComment });

  const displayError =
    error ?? editMode.mutationError ?? deletion.mutationError ?? commentDeletion.mutationError;

  const dismissError = useRef(() => {});
  dismissError.current = () => {
    toast.show({ tone: 'danger', title: displayError ?? '' });
    clearError();
    editMode.clearMutationError();
    deletion.clearMutationError();
    commentDeletion.clearMutationError();
  };

  useEffect(() => {
    if (!displayError) return;
    dismissError.current();
  }, [displayError]);

  const draftAssigneeName = useMemo(
    () => users.find((u) => u.uid === editMode.draftAssigneeId)?.name ?? UNASSIGNED_LABEL,
    [users, editMode.draftAssigneeId],
  );

  const actions: AppBarAction[] = [];
  if (user?.role === 'admin') {
    actions.push({
      icon: editMode.editing ? 'Check' : 'Pencil',
      label: editMode.editing ? 'Confirmar edição' : 'Editar chamado',
      onPress: editMode.onEditPress,
    });
    actions.push({
      icon: 'Trash2',
      label: 'Apagar chamado',
      onPress: () => deletion.setDeleteVisible(true),
    });
  }

  const appBar = (
    <AppBar
      title={editMode.editing ? 'Editando' : 'Chamado'}
      onBackPress={() => navigation.goBack()}
      actions={actions}
    />
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.flex}>
        {appBar}
        <View style={styles.center}>
          <Spinner />
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView edges={['top']} style={styles.flex}>
        {appBar}
        <View style={styles.center}>
          <Text>Chamado não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      {appBar}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {!editMode.editing && (
            <View style={styles.badgeRow}>
              <Badge tone={STATUS_TONES[ticket.status]}>{STATUS_LABELS[ticket.status]}</Badge>
              <Badge
                tone={PRIORITY_TONES[ticket.priority]}
                solid={isPriorityMaximum(ticket.priority)}
              >
                {PRIORITY_LABELS[ticket.priority]}
              </Badge>
            </View>
          )}

          <Text
            style={[editMode.editing ? styles.titleEditing : styles.title, { color: colors.text }]}
          >
            {ticket.title}
          </Text>

          {!editMode.editing && (
            <Text style={[styles.description, { color: alpha(colors.text, 80) }]}>
              {ticket.description}
            </Text>
          )}

          {!editMode.editing && (
            <TicketMetaRow
              creatorName={ticket.creatorName}
              createdAt={ticket.createdAt}
              assigneeName={ticket.assigneeName}
            />
          )}

          {editMode.editing && (
            <>
              <SectionLabel>Status</SectionLabel>
              <View style={styles.paddedRow}>
                <TicketOptionField
                  value={ticket.status}
                  editing={editMode.editing}
                  draft={editMode.draftStatus}
                  onChangeDraft={editMode.setDraftStatus}
                  options={ALL_STATUSES}
                  labels={STATUS_LABELS}
                  tones={STATUS_TONES}
                />
              </View>

              <SectionLabel>Prioridade</SectionLabel>
              <View style={styles.paddedRow}>
                <TicketOptionField
                  value={ticket.priority}
                  editing={editMode.editing}
                  draft={editMode.draftPriority}
                  onChangeDraft={editMode.setDraftPriority}
                  options={ALL_PRIORITIES}
                  labels={PRIORITY_LABELS}
                  tones={PRIORITY_TONES}
                />
              </View>

              <SectionLabel>Responsável</SectionLabel>
              <View style={styles.paddedRow}>
                <Select
                  value={editMode.draftAssigneeId}
                  onValueChange={(v) => editMode.setDraftAssigneeId(v)}
                  options={[
                    { label: UNASSIGNED_LABEL, value: '' },
                    ...users.map((u) => ({ label: u.name, value: u.uid })),
                  ]}
                />
              </View>
            </>
          )}

          {!editMode.editing && (
            <>
              <SectionLabel trailing={String(comments.length)}>Comentários</SectionLabel>

              {comments.length === 0 && (
                <Text style={[styles.emptyComments, { color: alpha(colors.text, 50) }]}>
                  Nenhum comentário ainda.
                </Text>
              )}

              {comments.map((c) => (
                <View style={styles.paddedRow} key={c.id}>
                  <CommentItem
                    comment={c}
                    canDelete={user?.uid === c.authorId || user?.role === 'admin'}
                    onDeletePress={() => commentDeletion.handleRequestDeleteComment(c.id)}
                  />
                </View>
              ))}

              <View style={styles.paddedRow}>
                <CommentInput
                  value={commentForm.commentText}
                  onChangeText={commentForm.setCommentText}
                  onSubmit={commentForm.handleAddComment}
                  disabled={!commentForm.commentText.trim() || commentForm.sendingComment}
                />
              </View>
            </>
          )}

          <Sheet
            open={editMode.saveVisible}
            onDismiss={editMode.handleCancelSave}
            title="Salvar alterações"
            actions={
              <>
                <Button key="cancel" variant="secondary" onPress={editMode.handleCancelSave}>
                  Cancelar
                </Button>
                <Button key="confirm" variant="primary" onPress={editMode.handleConfirmSave}>
                  Salvar
                </Button>
              </>
            }
          >
            <View style={styles.diffGrid}>
              <DiffRow
                label="Status"
                from={STATUS_LABELS[ticket.status]}
                to={STATUS_LABELS[editMode.draftStatus]}
              />
              <DiffRow
                label="Prioridade"
                from={PRIORITY_LABELS[ticket.priority]}
                to={PRIORITY_LABELS[editMode.draftPriority]}
              />
              <DiffRow
                label="Responsável"
                from={ticket.assigneeName ?? UNASSIGNED_LABEL}
                to={draftAssigneeName}
              />
            </View>
          </Sheet>

          <Sheet
            testID="delete-ticket-sheet"
            open={deletion.deleteVisible}
            onDismiss={() => deletion.setDeleteVisible(false)}
            title="Apagar ticket"
            actions={
              <>
                <Button
                  key="cancel"
                  variant="secondary"
                  onPress={() => deletion.setDeleteVisible(false)}
                >
                  Cancelar
                </Button>
                <Button key="confirm" variant="danger" onPress={deletion.handleDelete}>
                  Apagar
                </Button>
              </>
            }
          >
            <Text style={{ color: colors.text }}>Esta ação não pode ser desfeita.</Text>
          </Sheet>

          <Sheet
            open={commentDeletion.deleteCommentVisible}
            onDismiss={commentDeletion.handleCancelDeleteComment}
            title="Apagar comentário"
            actions={
              <>
                <Button
                  key="cancel"
                  variant="secondary"
                  onPress={commentDeletion.handleCancelDeleteComment}
                >
                  Cancelar
                </Button>
                <Button
                  key="confirm"
                  variant="danger"
                  onPress={commentDeletion.handleDeleteComment}
                >
                  Apagar
                </Button>
              </>
            }
          >
            <Text style={{ color: colors.text }}>Esta ação não pode ser desfeita.</Text>
          </Sheet>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
