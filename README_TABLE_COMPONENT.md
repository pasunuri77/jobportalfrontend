# Reusable Table Component

A flexible, production-ready Angular table component built as a standalone component with support for sorting, pagination, row selection, and custom templates.

## Location

- **Component**: `src/app/ui-components/reusable-table/reusable-table.component.ts`
- **Template**: `src/app/ui-components/reusable-table/reusable-table.component.html`
- **Styles**: `src/app/ui-components/reusable-table/reusable-table.component.css`
- **Tests**: `src/app/ui-components/reusable-table/reusable-table.component.spec.ts`

## Features

- ✅ **Configurable Columns** - Define columns with labels, types, and sorting options
- ✅ **Sorting** - Built-in sorting for text, number, and date columns
- ✅ **Pagination** - Automatic pagination with customizable page size
- ✅ **Row Selection** - Optional multi-select with select-all functionality
- ✅ **Multiple Cell Types**:
  - `text` - Plain text rendering
  - `number` - Formatted number display
  - `date` - Date formatting
  - `badge` - Status badges with conditional styling
  - `action` - Action buttons
  - `custom` - Custom template support
- ✅ **Loading State** - Loading spinner while fetching data
- ✅ **Empty State** - Customizable empty state message
- ✅ **Responsive Design** - Mobile-friendly layout
- ✅ **Event Emitters** - Full event support for interactions

## Usage

### Basic Example

```typescript
// In your component TypeScript file
import { ReusableTableComponent, TableColumn, TableConfig } from '@app/ui-components/reusable-table/reusable-table.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [ReusableTableComponent],
  template: `
    <app-reusable-table 
      [data]="users" 
      [config]="tableConfig"
      [isLoading]="isLoading"
      (rowClick)="onRowClick($event)"
      (rowAction)="onRowAction($event)"
    ></app-reusable-table>
  `
})
export class UsersPageComponent {
  users: any[] = [];
  isLoading = false;

  tableConfig: TableConfig = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: false },
      { key: 'role', label: 'Role', type: 'badge' },
      { key: 'edit', label: 'Actions', type: 'action' }
    ],
    pageSize: 10,
    striped: true,
    bordered: true,
    hoverable: true,
    selectable: true
  };

  onRowClick(row: any) {
    console.log('Row clicked:', row);
  }

  onRowAction(event: { action: string; row: any }) {
    console.log(`Action ${event.action} on row:`, event.row);
  }
}
```

### Advanced Example with Badges and Custom Styling

```typescript
tableConfig: TableConfig = {
  columns: [
    { key: 'id', label: 'ID', sortable: true, width: '60px', type: 'number' },
    { key: 'name', label: 'Name', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge',
      badgeClass: (value) => {
        switch(value?.toLowerCase()) {
          case 'active':
          case 'approved':
            return 'status-active';
          case 'inactive':
          case 'rejected':
            return 'status-inactive';
          default:
            return 'status-pending';
        }
      }
    },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
    { key: 'edit', label: 'Edit', type: 'action' }
  ],
  pageSize: 20,
  selectable: true
};
```

### Interfaces

#### TableColumn

```typescript
interface TableColumn {
  key: string;                           // Data property key
  label: string;                         // Column header label
  sortable?: boolean;                    // Enable sorting (default: false)
  width?: string;                        // Column width (CSS value)
  type?: 'text' | 'number' | 'date' | 'badge' | 'action' | 'custom';
  customTemplate?: TemplateRef<any>;     // Custom template for rendering
  badgeClass?: (value: any) => string;   // Badge CSS class mapper
}
```

#### TableConfig

```typescript
interface TableConfig {
  columns: TableColumn[];      // Array of column definitions
  pageSize?: number;           // Rows per page (default: 10)
  striped?: boolean;           // Alternating row colors (default: true)
  bordered?: boolean;          // Table borders (default: true)
  hoverable?: boolean;         // Row hover effect (default: true)
  selectable?: boolean;        // Enable row selection (default: false)
}
```

## Events

### rowClick
Emitted when a row is clicked

```typescript
(rowClick)="onRowClick($event)"

onRowClick(row: any) {
  // row is the clicked data object
}
```

### rowAction
Emitted when an action button is clicked

```typescript
(rowAction)="onRowAction($event)"

onRowAction(event: { action: string; row: any }) {
  const { action, row } = event;
  // action is the column.key for action-type columns
}
```

### selectionChange
Emitted when rows are selected/deselected

```typescript
(selectionChange)="onSelectionChange($event)"

onSelectionChange(selectedRows: any[]) {
  // selectedRows is an array of selected data objects
}
```

### sortChange
Emitted when sorting is applied

```typescript
(sortChange)="onSortChange($event)"

onSortChange(event: { column: string; direction: 'asc' | 'desc' }) {
  // Perform server-side sorting if needed
}
```

### pageChange
Emitted when page is changed

```typescript
(pageChange)="onPageChange($event)"

onPageChange(page: number) {
  // Perform server-side data fetching if needed
}
```

## Input Properties

- `@Input() data: any[]` - Array of data objects to display (default: [])
- `@Input() config: TableConfig` - Table configuration object
- `@Input() isLoading: boolean` - Show loading state (default: false)
- `@Input() emptyStateMessage: string` - Message when no data (default: 'No data available')

## Styling

### Badge Status Classes

The component includes predefined badge classes that can be used:

```css
.badge.status-active        /* Green badge */
.badge.status-inactive      /* Red/amber badge */
.badge.status-pending       /* Orange badge */
.badge.role-admin           /* Green for admin */
.badge.role-user            /* Amber for user */
.badge.role-company         /* Orange for company */
```

### Custom Styling

Override component styles by adding styles to your component or global stylesheet:

```css
/* Override table header background */
app-reusable-table table thead {
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
}

/* Override row hover color */
app-reusable-table table.hoverable tbody tr:hover {
  background-color: #f0f4ff;
}
```

## Integration Examples

### Admin Dashboard - Users List

```typescript
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [ReusableTableComponent, CommonModule]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  isLoading = false;

  tableConfig: TableConfig = {
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', type: 'badge' },
      { key: 'delete', label: 'Delete', type: 'action' }
    ],
    pageSize: 15,
    selectable: true
  };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      }
    });
  }

  onRowAction(event: { action: string; row: any }) {
    if (event.action === 'delete') {
      this.deleteUser(event.row.id);
    }
  }

  deleteUser(id: string) {
    this.userService.delete(id).subscribe(() => {
      this.loadUsers();
    });
  }
}
```

### Applications Management - View List

```typescript
tableConfig: TableConfig = {
  columns: [
    { key: 'jobTitle', label: 'Job Title', sortable: true },
    { key: 'applicantName', label: 'Applicant', sortable: true },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'appliedDate', label: 'Applied', type: 'date', sortable: true },
    { key: 'view', label: 'View', type: 'action' }
  ],
  pageSize: 20
};
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- **TrackBy Function**: Automatically uses `id` property or array index for change detection
- **Pagination**: Reduces DOM nodes rendered by limiting rows per page
- **Virtual Scrolling**: Can be added by wrapping table in a virtual scroller for large datasets
- **OnPush Strategy**: Component uses default change detection; consider adding `ChangeDetectionStrategy.OnPush` for optimization

## Testing

Unit tests are available in `reusable-table.component.spec.ts`. Run tests with:

```bash
npm test
```

Test coverage includes:
- Component creation
- Table configuration
- Data rendering and pagination
- Sorting functionality
- Row selection
- Event emissions
- Cell formatting
- Page number generation
