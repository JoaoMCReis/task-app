import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TasksService, CreateTaskDto, UpdateTaskDto } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { ButtonComponent } from '../../shared/components/button/button';
import { TableColumn } from '../../shared/components/table/table';
import { TableComponent } from '../../shared/components/table/table';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormsModule, TableComponent],
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
    private tasksService = inject(TasksService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    tasks = signal<Task[]>([]);
    users = signal<User[]>([]);
    loading = signal(false);
    errorMessage = signal('');

    showForm = signal(false);
    editing = signal(false);
    editingTaskId = signal<string | null>(null);

    page = signal(1);
    pageSize = signal(5);

    totalCount = signal(0);

    taskForm: FormGroup = this.fb.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
        status: [0, Validators.required],
        assignedToId: ['']
    });

    ngOnInit() {
        this.loadUsers();
    }

    constructor() {
        this.loadTasks();
    }

    loadTasks() {
        this.loading.set(true);
        this.errorMessage.set('');

        this.tasksService.getAll(undefined, this.page(), this.pageSize()).subscribe({
            next: (res) => {
                this.tasks.set(res.items);
                this.totalCount.set(res.totalCount);
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('Erro ao carregar tarefas.');
                this.loading.set(false);
            }
        });
    }

    loadUsers() {
        this.userService.getAll().subscribe({
            next: (users) => {
                console.log('RESPOSTA COMPLETA DOS USERS:', users);

                users.forEach((u, index) => {
                    console.log(`User ${index}:`, {
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        tipo_id: typeof u.id
                    });
                });

                this.users.set(users);
            },
            error: (err) => {
                console.error('Erro ao carregar utilizadores:', err);
            }
        });
    }

    nextPage() {
        this.page.update(p => p + 1);
        this.loadTasks();
    }

    prevPage() {
        if (this.page() > 1) {
            this.page.update(p => p - 1);
            this.loadTasks();
        }
    }

    // taskColumns = computed<TableColumn<Task>[]>(() => [
    //     {
    //         label: 'Título',
    //         field: 'title',
    //         sortable: true
    //     },
    //     {
    //         label: 'Descrição',
    //         field: 'description',
    //         sortable: true
    //     },
    //     {
    //         label: 'Status',
    //         field: 'status',
    //         sortable: true,
    //         template: (task: Task) => {
    //             const statusLabel = this.getStatusLabel(task.status);
    //             return `<span class="status-badge status-${task.status}">${statusLabel}</span>`;
    //         }
    //     },
    //     {
    //         label: 'Criador',
    //         field: 'createdById',
    //         sortable: true,
    //         template: (task: Task) => this.getCreatorName(task.createdById)
    //     },
    //     {
    //         label: 'Atribuída a',
    //         field: 'assignedToId',
    //         sortable: true,
    //         template: (task: Task) => this.getUserName(task.assignedToId)
    //     },
    //     {
    //         label: 'Ações',
    //         field: 'actions' as any,
    //         template: (task: Task) => {
    //             const buttons: string[] = [];

    //             if (this.canEdit(task)) {
    //                 buttons.push(`<button class="btn-edit" data-action="edit" data-id="${task.id}">Editar</button>`);
    //             }

    //             if (this.canDelete(task)) {
    //                 buttons.push(`<button class="btn-delete" data-action="delete" data-id="${task.id}">Eliminar</button>`);
    //             }

    //             return buttons.length > 0 ? buttons.join(' ') : '<span class="no-actions">—</span>';
    //         }
    //     }
    // ]);

    handleEdit(task: Task) {
        this.openEdit(task);
    }

    handleDelete(task: Task) {
        this.deleteTask(task);
    }

    openCreate() {
        this.taskForm.reset({
            title: '',
            description: '',
            status: 0,
            assignedToId: ''
        });

        console.log('🔍 Users disponíveis no form:', this.users());
        console.log('🔍 IDs disponíveis:', this.users().map(u => u.id));

        this.editing.set(false);
        this.editingTaskId.set(null);
        this.showForm.set(true);
    }

    openEdit(task: Task) {
        if (!this.canEdit(task)) {
            alert('Não tem permissão para editar esta tarefa.');
            return;
        }

        this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            status: task.status,
            assignedToId: task.assignedToId || ''
        });
        this.editing.set(true);
        this.editingTaskId.set(task.id);
        this.showForm.set(true);
    }

    cancelForm() {
        this.showForm.set(false);
        this.taskForm.reset();
    }

    saveTask() {
        if (this.taskForm.invalid) return;

        const formData = this.taskForm.value;

        if (this.editing()) {
            const updateDto: UpdateTaskDto = {
                title: formData.title,
                description: formData.description,
                status: formData.status
            };

            if (formData.assignedToId) {
                updateDto.assignedToId = formData.assignedToId;
            }

            console.log('📤 UPDATE DTO:', updateDto);

            this.tasksService.update(this.editingTaskId()!, updateDto).subscribe({
                next: () => {
                    this.showForm.set(false);
                    this.loadTasks();
                },
                error: (err) => {
                    console.error('❌ ERRO UPDATE:', err);
                    alert('Erro ao atualizar tarefa.');
                }
            });
        } else {
            const createDto: any = {
                title: formData.title,
                description: formData.description,
                status: 0
            };

            if (formData.assignedToId) {
                createDto.assignedToId = formData.assignedToId;
            }

            console.log('📤 CREATE DTO:', createDto);

            this.tasksService.create(createDto).subscribe({
                next: () => {
                    this.showForm.set(false);
                    this.loadTasks();
                },
                error: (err) => {
                    console.error('❌ ERRO CREATE:', err);
                    console.error('❌ Response body:', err.error);
                    alert('Erro ao criar tarefa.');
                }
            });
        }
    }

    deleteTask(task: Task) {
        if (!this.canDelete(task)) {
            alert('Não tem permissão para eliminar esta tarefa.');
            return;
        }

        if (!confirm(`Deseja realmente eliminar a tarefa "${task.title}"?`)) return;

        this.tasksService.delete(task.id).subscribe({
            next: () => {
                this.tasks.set(this.tasks().filter(t => t.id !== task.id));
            },
            error: (err) => {
                console.error(err);
                alert('Erro ao eliminar tarefa. Verifique as suas permissões.');
            }
        });
    }

    canEdit(task: Task): boolean {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return false;

        const role = currentUser.role;

        // Admin pode editar tudo
        if (role === 'admin') return true;

        if (role === 'manager') return true;

        if (role === 'member') {
            return task.createdById === currentUser.id || task.assignedToId === currentUser.id;
        }

        return false;
    }

    canDelete(task: Task): boolean {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return false;

        const role = currentUser.role;

        if (role === 'admin') return true;

        if (role === 'manager' || role === 'member') {
            return task.createdById === currentUser.id;
        }

        return false;
    }

    canCreate(): boolean {
        return this.authService.isAuthenticated();
    }

    getStatusLabel(status: number): string {
        const labels: Record<number, string> = {
            0: 'Pendente',
            1: 'Em Progresso',
            2: 'Concluída'
        };
        return labels[status] || 'Desconhecido';
    }

    getUserName(userId?: string): string {
        if (!userId) return 'Não atribuída';
        const user = this.users().find(u => u.id === userId);
        return user ? user.name : 'Desconhecido';
    }

    getCreatorName(creatorId: string): string {
        if (!creatorId) return 'Desconhecido';
        const user = this.users().find(u => u.id === creatorId);
        return user ? user.name : 'Desconhecido';
    }
}