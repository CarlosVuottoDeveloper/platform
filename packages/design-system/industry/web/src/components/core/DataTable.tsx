import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { TEXT_TINT_FILLS, resolveFill } from './stateFills';

export interface Column<Row extends Record<string, ReactNode> = Record<string, ReactNode>> {
  key: string;
  label?: ReactNode;
  width?: number | string;
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
  style?: CSSProperties;
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
}: DataTableProps<Row>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%', ...style }}>
      {toolbar ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            paddingBottom: 'var(--space-3)',
            flex: 'none',
          }}
        >
          {toolbar}
        </div>
      ) : null}
      <div
        style={{
          flex: '0 1 auto',
          minHeight: 0,
          overflow: 'auto',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text)',
          }}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    height: 'var(--tap)',
                    textAlign: 'left',
                    fontSize: 'var(--text-h6)',
                    fontWeight: 'var(--font-medium-weight)',
                    color: 'var(--color-neutral-400)',
                    background: 'var(--color-surface-2)',
                    padding: '0 var(--space-3)',
                    whiteSpace: 'nowrap',
                    width: column.width,
                  }}
                >
                  {column.sortable === false || !onSort ? (
                    column.label
                  ) : (
                    <SortButton
                      active={sort?.key === column.key}
                      direction={sort?.key === column.key ? sort.dir : undefined}
                      onClick={() => onSort(column.key)}
                    >
                      {column.label}
                    </SortButton>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <DataRow key={(row.id as string | number | undefined) ?? index}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: 'var(--space-3)',
                      ...(index < rows.length - 1
                        ? {
                            borderBottomWidth: 1,
                            borderBottomStyle: 'solid',
                            borderBottomColor: 'var(--color-divider)',
                          }
                        : undefined),
                    }}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </DataRow>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 ? (
        <Pagination page={page} pageCount={pageCount} total={total} onPage={onPage} />
      ) : null}
    </div>
  );
}

function DataRow({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? TEXT_TINT_FILLS.hovered : TEXT_TINT_FILLS.rest }}
    >
      {children}
    </tr>
  );
}

function SortButton({
  active,
  direction,
  onClick,
  children,
}: {
  active: boolean;
  direction?: 'asc' | 'desc';
  onClick: () => void;
  children?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const ariaSort =
    direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : undefined;

  return (
    <button
      type="button"
      aria-sort={ariaSort}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'none',
        border: 0,
        cursor: 'pointer',
        font: 'inherit',
        minHeight: 'var(--tap)',
        outlineOffset: -2,
        color: active ? 'var(--color-accent-200)' : hovered ? 'var(--color-text)' : 'inherit',
        padding: 0,
      }}
    >
      {children}
      <Caret direction={direction} />
    </button>
  );
}

function Caret({ direction }: { direction?: 'asc' | 'desc' }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 0,
        height: 0,
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: direction === 'asc' ? '5px solid currentColor' : undefined,
        borderTop: direction === 'desc' ? '5px solid currentColor' : undefined,
      }}
    />
  );
}

function Pagination({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total?: number;
  onPage?: (page: number) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
        flex: 'none',
        paddingTop: 'var(--space-3)',
      }}
    >
      <span
        style={{
          marginRight: 'auto',
          fontSize: 'var(--text-h6)',
          color: 'var(--color-neutral-400)',
        }}
      >
        {total != null ? `${total} registros` : `Página ${page} de ${pageCount}`}
      </span>
      <PagerButton disabled={page <= 1} onClick={onPage ? () => onPage(page - 1) : undefined}>
        Anterior
      </PagerButton>
      {Array.from({ length: pageCount }).map((_, index) => (
        <PagerButton
          key={index}
          current={page === index + 1}
          onClick={onPage ? () => onPage(index + 1) : undefined}
        >
          {index + 1}
        </PagerButton>
      ))}
      <PagerButton
        disabled={page >= pageCount}
        onClick={onPage ? () => onPage(page + 1) : undefined}
      >
        Próxima
      </PagerButton>
    </div>
  );
}

function PagerButton({
  current,
  disabled,
  onClick,
  children,
}: {
  current?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={current ? 'page' : undefined}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        minWidth: 'var(--tap)',
        minHeight: 'var(--tap)',
        padding: '0 var(--space-2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: current
          ? 'var(--color-accent)'
          : resolveFill(TEXT_TINT_FILLS, hovered && !disabled, pressed && !disabled),
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 'var(--radius-pill)',
        borderColor: current ? 'var(--color-accent)' : 'var(--color-control-border)',
        color: current ? 'var(--color-bg)' : 'inherit',
        font: 'inherit',
        fontSize: 'var(--text-h6)',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {children}
    </button>
  );
}
