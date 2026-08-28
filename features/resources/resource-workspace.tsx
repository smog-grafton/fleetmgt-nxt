'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ColumnDef, PaginationState, SortingState, VisibilityState, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Eye, Filter, MoreHorizontal, Pencil, Plus, RefreshCw, Search, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { apiDelete, apiGet, apiPost } from '@/lib/api/client';
import { ResourceListMeta, ResourceRecord, ResourceSchema } from '@/types/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input, InputWrapper } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ResourceDetails } from './resource-details';
import { ResourceForm } from './resource-form';
import { ValueDisplay } from './value-display';

type DrawerState = { mode: 'create' } | { mode: 'edit' | 'view'; record: ResourceRecord } | null;

export function ResourceWorkspace({ resource, initialRecordId }: { resource: string; initialRecordId?: number }) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: true }]);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [deleting, setDeleting] = useState<ResourceRecord | null>(null);
  const schemaQuery = useQuery({ queryKey: ['resource-schema', resource], queryFn: () => apiGet<ResourceSchema>(`resources/${resource}/schema`) });
  const queryString = useMemo(() => { const params = new URLSearchParams({ page: String(pagination.pageIndex + 1), per_page: String(pagination.pageSize) }); if (search.trim()) params.set('q', search.trim()); if (sorting[0]) { params.set('sort', sorting[0].id); params.set('direction', sorting[0].desc ? 'desc' : 'asc'); } Object.entries(filters).forEach(([key, value]) => { if (value) params.set(`filter[${key}]`, value); }); return params.toString(); }, [pagination, search, filters, sorting]);
  const listQuery = useQuery({ queryKey: ['resource-list', resource, queryString], queryFn: () => apiGet<ResourceRecord[]>(`resources/${resource}?${queryString}`), placeholderData: (previous) => previous });
  const schema = schemaQuery.data?.data;
  const createDefaults = useMemo(() => schema ? Object.fromEntries(Object.keys(schema.fields).map((field) => [field, searchParams.get(field)]).filter((entry): entry is [string, string] => entry[1] !== null)) : {}, [schema, searchParams]);
  useEffect(() => { if (searchParams.get('create') === '1' && schema) setDrawer({ mode: 'create' }); }, [searchParams, schema]);
  useEffect(() => { if (!initialRecordId || !schema) return; void apiGet<ResourceRecord>(`resources/${resource}/${initialRecordId}`).then((result) => setDrawer({ mode: 'view', record: result.data })).catch(() => undefined); }, [initialRecordId, resource, schema]);
  const actionMutation = useMutation({ mutationFn: ({ record, action }: { record: ResourceRecord; action: string }) => apiPost(`resources/${resource}/${record.id}/actions/${action}`), onSuccess: (result) => { toast.success(result.message); void queryClient.invalidateQueries({ queryKey: ['resource-list', resource] }); } });
  const deleteMutation = useMutation({ mutationFn: (record: ResourceRecord) => apiDelete(`resources/${resource}/${record.id}`), onSuccess: (result) => { toast.success(result.message); setDeleting(null); void queryClient.invalidateQueries({ queryKey: ['resource-list', resource] }); } });
  const columns = useMemo<ColumnDef<ResourceRecord>[]>(() => {
    if (!schema) return [];
    const result: ColumnDef<ResourceRecord>[] = Object.entries(schema.columns).map(([field, label]) => ({ id: field, accessorFn: (row: ResourceRecord) => row[field], header: ({ column }) => <button className="flex items-center gap-1.5 font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>{label}{column.getIsSorted() === 'asc' ? <ArrowUp className="size-3.5" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-40" />}</button>, cell: ({ row }) => <ValueDisplay value={row.original[field]} field={field} lookup={schema.lookups[field]} />, meta: { headerTitle: label, skeleton: <Skeleton className="h-5 w-24" /> } }));
    result.push({ id: 'row-actions', header: '', enableHiding: false, enableSorting: false, size: 70, cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" mode="icon" onClick={(event) => event.stopPropagation()} aria-label="Record actions"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={(event) => { event.stopPropagation(); setDrawer({ mode: 'view', record: row.original }); }}><Eye />View details</DropdownMenuItem>{schema.capabilities?.update !== false && <DropdownMenuItem onSelect={(event) => { event.stopPropagation(); setDrawer({ mode: 'edit', record: row.original }); }}><Pencil />Edit</DropdownMenuItem>}{Object.entries(schema.actions).length > 0 && <DropdownMenuSeparator />}{Object.entries(schema.actions).map(([action, label]) => <DropdownMenuItem key={action} disabled={actionMutation.isPending} onSelect={(event) => { event.stopPropagation(); actionMutation.mutate({ record: row.original, action }); }}><Zap />{label}</DropdownMenuItem>)}{schema.capabilities?.delete !== false && <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={(event) => { event.stopPropagation(); setDeleting(row.original); }}><Trash2 />Delete</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu> });
    return result;
  }, [schema, actionMutation]);
  const meta = (listQuery.data?.meta || {}) as unknown as ResourceListMeta;
  const table = useReactTable({ data: listQuery.data?.data || [], columns, pageCount: meta.last_page || 1, state: { pagination, columnVisibility: visibility, sorting }, onPaginationChange: setPagination, onColumnVisibilityChange: setVisibility, onSortingChange: setSorting, manualPagination: true, manualSorting: true, getCoreRowModel: getCoreRowModel() });
  const filterFields = schema ? Object.entries(schema.fields).filter(([name, field]) => field.type === 'select' && schema.lookups[name] && Object.keys(schema.lookups[name]).length <= 50).slice(0, 3) : [];

  if (schemaQuery.isLoading) return <div className="mx-auto max-w-[1600px] space-y-5"><Skeleton className="h-20" /><Skeleton className="h-[520px]" /></div>;
  if (!schema) return <Card><CardContent className="py-14 text-center"><p className="font-medium">This resource could not be loaded.</p><p className="mt-1 text-sm text-muted-foreground">{schemaQuery.error?.message}</p><Button className="mt-4" onClick={() => void schemaQuery.refetch()}>Try again</Button></CardContent></Card>;
  return <div className="mx-auto max-w-[1600px] space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><Badge variant="primary" appearance="light">{resource.includes('income') || resource.includes('expense') || resource.includes('finance') ? 'Dimensional Finance' : 'Operations V2'}</Badge><span className="text-xs text-muted-foreground">{meta.total ?? 0} records</span></div><h1 className="text-2xl font-semibold tracking-tight">{schema.label}</h1><p className="mt-1 text-sm text-muted-foreground">Search, filter, review and manage {schema.label.toLowerCase()}.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void listQuery.refetch()}><RefreshCw className={listQuery.isFetching ? 'animate-spin' : ''} />Refresh</Button>{schema.capabilities?.create !== false && <Button onClick={() => setDrawer({ mode: 'create' })}><Plus />Add {schema.singular}</Button>}</div></div>
    <Card><CardHeader className="gap-3"><div><CardTitle>{schema.label}</CardTitle><CardDescription>Server-paginated data grid connected to the Laravel resource API.</CardDescription></div><CardToolbar className="flex-wrap"><InputWrapper className="w-64"><Search /><Input placeholder={`Search ${schema.label.toLowerCase()}…`} value={search} onChange={(event) => { setSearch(event.target.value); setPagination((value) => ({ ...value, pageIndex: 0 })); }} /></InputWrapper><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline"><Columns3 />Columns</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Visible columns</DropdownMenuLabel>{table.getAllLeafColumns().filter((column) => column.getCanHide()).map((column) => <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}>{schema.columns[column.id]}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu></CardToolbar></CardHeader>
      {filterFields.length > 0 && <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3"><Filter className="size-4 text-muted-foreground" />{filterFields.map(([name, field]) => <Select key={name} value={filters[name] || '__all__'} onValueChange={(value) => { setFilters((current) => ({ ...current, [name]: value === '__all__' ? '' : value })); setPagination((current) => ({ ...current, pageIndex: 0 })); }}><SelectTrigger className="w-48"><SelectValue placeholder={field.label} /></SelectTrigger><SelectContent><SelectItem value="__all__">All {field.label}</SelectItem>{Object.entries(schema.lookups[name]).filter(([value]) => value !== '').map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>)}</div>}
      <CardContent className="p-0"><DataGrid table={table} recordCount={meta.total || 0} isLoading={listQuery.isFetching} onRowClick={(record) => setDrawer({ mode: 'view', record })} tableLayout={{ columnsVisibility: true, columnsResizable: true, headerSticky: true }} emptyMessage={search || Object.values(filters).some(Boolean) ? 'No records match the current filters.' : `No ${schema.label.toLowerCase()} have been created.`}><DataGridContainer border={false}><div className="max-h-[62vh] overflow-auto"><DataGridTable /></div><div className="border-t px-4"><DataGridPagination sizes={[10, 25, 50, 100]} /></div></DataGridContainer></DataGrid></CardContent>
    </Card>
    <Sheet open={Boolean(drawer)} onOpenChange={(open) => !open && setDrawer(null)}><SheetContent className="w-full gap-0 p-0 sm:max-w-2xl"><SheetHeader className="border-b px-6 py-5 text-start"><SheetTitle>{drawer?.mode === 'create' ? `Add ${schema.singular}` : drawer?.mode === 'edit' ? `Edit ${schema.singular}` : `${schema.singular} details`}</SheetTitle><SheetDescription>{drawer?.mode === 'view' ? `Record #${drawer.record.id}` : 'Fields and rules come from the live Laravel Operations V2 schema.'}</SheetDescription></SheetHeader>{drawer?.mode === 'view' ? <ResourceDetails schema={schema} record={drawer.record} /> : drawer ? <ResourceForm schema={schema} record={drawer.mode === 'edit' ? drawer.record : null} defaults={drawer.mode === 'create' ? createDefaults : {}} onSaved={() => setDrawer(null)} onCancel={() => setDrawer(null)} /> : null}</SheetContent></Sheet>
    <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this {schema.singular.toLowerCase()}?</AlertDialogTitle><AlertDialogDescription>This is permanent and may be blocked by Operations V2 integrity rules. Prefer status changes for auditable financial and operational records.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => deleting && deleteMutation.mutate(deleting)}>Delete record</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
