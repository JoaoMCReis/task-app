import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { ButtonComponent } from '../../shared/components/button/button';


@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
    templateUrl: './users.html',
    styleUrls: ['./users.css']
})
export class UsersComponent {
    private userService = inject(UserService);
    private fb = inject(FormBuilder);

    users = signal<User[]>([]);
    loading = signal(false);
    errorMessage = signal('');

    showForm = signal(false);
    editing = signal(false);
    editingUserId = signal<string | null>(null);

    userForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        passwordHash: [''],
        role: ['member', Validators.required]
    });

    constructor() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading.set(true);
        this.errorMessage.set('');

        this.userService.getAll().subscribe({
            next: (users) => {
                this.users.set(users);
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('Erro ao carregar utilizadores.');
                this.loading.set(false);
            }
        });
    }

    openCreate() {
        this.userForm.reset({ name: '', email: '', passwordHash: '', role: 'member' });
        this.userForm.get('passwordHash')?.setValidators(Validators.required);
        this.userForm.get('passwordHash')?.updateValueAndValidity();
        this.editing.set(false);
        this.editingUserId.set(null);
        this.showForm.set(true);
    }

    openEdit(user: User) {
        this.userForm.patchValue({
            name: user.name,
            email: user.email,
            role: user.role,
            passwordHash: ''
        });
        this.userForm.get('passwordHash')?.clearValidators();
        this.userForm.get('passwordHash')?.updateValueAndValidity();
        this.editing.set(true);
        this.editingUserId.set(user.id);
        this.showForm.set(true);
    }

    cancelForm() {
        this.showForm.set(false);
        this.userForm.reset();
    }

    saveUser() {
        if (this.userForm.invalid) return;

        const formData = this.userForm.value;

        if (this.editing()) {
            const updatedUser: User = {
                id: this.editingUserId()!,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                passwordHash: formData.passwordHash || ''
            };

            this.userService.update(updatedUser.id, updatedUser).subscribe({
                next: () => {
                    this.showForm.set(false);
                    this.loadUsers();
                },
                error: () => alert('Erro ao atualizar utilizador.')
            });
        } else {
            this.userService.create(formData).subscribe({
                next: () => {
                    this.showForm.set(false);
                    this.loadUsers();
                },
                error: () => alert('Erro ao criar utilizador.')
            });
        }
    }

    deleteUser(user: User) {
        if (!confirm(`Deseja realmente eliminar o utilizador "${user.name}"?`)) return;

        this.userService.delete(user.id).subscribe({
            next: () => {
                this.users.set(this.users().filter(u => u.id !== user.id));
            },
            error: () => alert('Erro ao eliminar utilizador.')
        });
    }
}