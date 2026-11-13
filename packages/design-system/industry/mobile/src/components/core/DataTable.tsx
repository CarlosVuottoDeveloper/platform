import { FlatList, Pressable, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import {
  accentRamp,
  color,
  control,
  fontSize,
  fontWeight,
  neutral,
  radii,
  space,
  fontFamily,
} from '@industry/tokens';
import { Icon } from './Icon';

export interface Column<Row extends Record<string, ReactNode> = Record<string, ReactNode>> {
  key: string;
  label?: ReactNode;
  width?: number;
  /** Set false for a column that cannot be sorted. */
  sortable?: boolean;
  /** Custom cell renderer — return a badge, a link, formatted text. */
  render?: (row: Row) => ReactNode;
}

export interface DataTableProps<Row extends Record<string, ReactNode> = Record<string, ReactNode>> {
  columns?: Column<Row>[];
  rows?: Row[];
  sort?: { key: string; dir: 'asc' | 'desc' };
  onSort?: (key: string) => void;
  page?: number;
  pageCount?: number;
  onPage?: (page: number) => void;
  /** Record count shown at the left of the pager. */
  total?: number;
  /** Row above the table — search, filters, actions. */
  toolbar?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Sorting, filtering and paging are controlled — the table renders, you own the data. */
export function DataTable<Row extends Record<string, ReactNode> = Record<string, ReactNode>>({
  columns = [],
  rows = [],
  sort,
  onSort,
  page = 1,
  pageCount = 1,
  onPage,
  total,
  toolbar,
  style,
  testID,
}: DataTableProps<Row>) {
  return (
    <View testID={testID} style={style}>
      {toolbar ? <View style={{ paddingBottom: space[3] }}>{toolbar}</View> : null}
      <View
        testID={testID ? `${testID}-surface` : undefined}
        style={{
          flexShrink: 1,
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          overflow: 'hidden',
        }}
      >
        <View
          testID={testID ? `${testID}-header` : undefined}
          style={{ flexDirection: 'row', backgroundColor: color.surface2 }}
        >
          {columns.map((column) => {
            const direction =
              column.sortable !== false && sort?.key === column.key ? sort.dir : undefined;
            return (
              <View
                key={column.key}
                style={{
                  width: column.width,
                  flex: column.width ? undefined : 1,
                  paddingHorizontal: space[3],
                }}
              >
                <ColumnHeader
                  columnKey={column.key}
                  direction={direction}
                  onPress={
                    column.sortable !== false && onSort ? () => onSort(column.key) : undefined
                  }
                >
                  {column.label}
                </ColumnHeader>
              </View>
            );
          })}
        </View>
        <FlatList
          data={rows}
          keyExtractor={(row, index) => String((row.id as string | number | undefined) ?? index)}
          renderItem={({ item: row, index }) => (
            <View
              testID={testID ? `${testID}-row-${index}` : undefined}
              style={{
                flexDirection: 'row',
                borderBottomWidth: index < rows.length - 1 ? 1 : undefined,
                borderBottomColor: color.divider,
              }}
            >
              {columns.map((column) => (
                <View
                  key={column.key}
                  style={{
                    width: column.width,
                    flex: column.width ? undefined : 1,
                    padding: space[3],
                  }}
                >
                  {column.render ? (
                    <Cell>{column.render(row)}</Cell>
                  ) : (
                    <Text
                      style={{
                        fontFamily: fontFamily.body,
                        fontSize: fontSize.body,
                        color: color.text,
                      }}
                    >
                      {row[column.key]}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        />
      </View>
      {pageCount > 1 ? (
        <Pagination
          page={page}
          pageCount={pageCount}
          total={total}
          onPage={onPage}
          testID={testID ? `${testID}-pager` : undefined}
        />
      ) : null}
    </View>
  );
}

function Cell({ children }: { children?: ReactNode }) {
  return typeof children === 'string' || typeof children === 'number' ? (
    <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.body, color: color.text }}>
      {children}
    </Text>
  ) : (
    <>{children}</>
  );
}

const DIRECTION_ANNOUNCEMENT = { asc: 'crescente', desc: 'decrescente' } as const;

function ColumnHeader({
  columnKey,
  direction,
  onPress,
  children,
}: {
  columnKey: string;
  direction?: 'asc' | 'desc';
  onPress?: () => void;
  children?: ReactNode;
}) {
  const active = direction !== undefined;
  const layout = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    minHeight: control.tap,
  } as const;
  const content = (
    <>
      <Text
        accessibilityLabel={
          active && typeof children === 'string'
            ? `${children}, ordenado em ordem ${DIRECTION_ANNOUNCEMENT[direction]}`
            : undefined
        }
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.h6,
          fontWeight: fontWeight.medium,
          color: active ? accentRamp['200'] : neutral['400'],
        }}
      >
        {children}
      </Text>
      {active ? (
        <Icon
          name={direction === 'desc' ? 'ChevronDown' : 'ChevronUp'}
          size="xs"
          color={accentRamp['200']}
        />
      ) : null}
    </>
  );

  return onPress ? (
    <Pressable
      testID={`sort-header-${columnKey}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({ ...layout, opacity: pressed ? 0.6 : 1 })}
    >
      {content}
    </Pressable>
  ) : (
    <View style={layout}>{content}</View>
  );
}

function Pagination({
  page,
  pageCount,
  total,
  onPage,
  testID,
}: {
  page: number;
  pageCount: number;
  total?: number;
  onPage?: (page: number) => void;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: space[2],
        paddingTop: space[3],
      }}
    >
      <Text
        style={{
          fontFamily: fontFamily.body,
          flexBasis: '100%',
          fontSize: fontSize.h6,
          color: neutral['400'],
        }}
      >
        {total != null ? `${total} registros` : `Página ${page} de ${pageCount}`}
      </Text>
      <PagerButton disabled={page <= 1} onPress={onPage ? () => onPage(page - 1) : undefined}>
        Anterior
      </PagerButton>
      {Array.from({ length: pageCount }).map((_, index) => (
        <PagerButton
          key={index}
          current={page === index + 1}
          onPress={onPage ? () => onPage(index + 1) : undefined}
        >
          {String(index + 1)}
        </PagerButton>
      ))}
      <PagerButton
        disabled={page >= pageCount}
        onPress={onPage ? () => onPage(page + 1) : undefined}
      >
        Próxima
      </PagerButton>
    </View>
  );
}

function PagerButton({
  current,
  disabled,
  onPress,
  children,
}: {
  current?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children?: ReactNode;
}) {
  return (
    <Pressable
      testID={`pager-btn-${children}`}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: current }}
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: control.tap,
        minHeight: control.tap,
        paddingHorizontal: space[2],
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: current ? color.accent : 'transparent',
        borderWidth: 1,
        borderColor: current ? color.accent : color.controlBorder,
        opacity: disabled ? 0.35 : pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.h6,
          color: current ? color.bg : color.text,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
