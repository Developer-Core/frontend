import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { IamApi } from '../infrastructure/iam-api.js';
import { AuthenticatedUserAssembler } from '../infrastructure/authenticated-user.assembler.js';
import { UserAssembler } from '../infrastructure/user.assembler.js';
import { notifySuccess, notifyError } from '../../shared/presentation/app-toast.js';

const iamApi = new IamApi();

/**
 * Application service store for the IAM bounded context. It coordinates the
 * authentication use cases and exposes UI-facing identity state.
 *
 * The session survives a page refresh: `isSignedIn` is seeded from the token
 * persisted in local storage, and `currentToken` reads it back on demand.
 *
 * @module useIamStore
 */
const useIamStore = defineStore('iam', () => {
    /** @type {import('vue').Ref<boolean>} Whether a user is currently signed in. */
    const isSignedIn = ref(!!localStorage.getItem('token'));
    /** @type {import('vue').Ref<number>} Current signed-in user identifier (seeded from storage). */
    const currentUserId = ref(Number(localStorage.getItem('userId')) || 0);
    /** @type {import('vue').Ref<string|null>} Current signed-in user email (seeded from storage). */
    const currentEmail = ref(localStorage.getItem('email'));
    /** @type {import('vue').Ref<string|null>} Current signed-in user role (seeded from storage). */
    const currentRole = ref(localStorage.getItem('role'));
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by IAM use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/user.entity.js').User>>} User directory (e.g. carpenters). */
    const users = ref([]);
    /** @type {import('vue').ComputedRef<string|null>} Bearer token persisted in local storage. */
    const currentToken = computed(() => (isSignedIn.value ? localStorage.getItem('token') : null));

    /**
     * Executes the sign-in use case and updates the authentication state.
     * @param {import('../domain/sign-in.command.js').SignInCommand} signInCommand - Credentials.
     * @param {import('vue-router').Router} router - Router used to redirect on result.
     * @returns {Promise<void>}
     */
    function signIn(signInCommand, router) {
        return iamApi.signIn(signInCommand)
            .then(response => {
                const resource = AuthenticatedUserAssembler.toResourceFromResponse(response);
                const user = UserAssembler.toEntityFromResource(resource);
                currentUserId.value = user.id;
                currentEmail.value  = user.email;
                currentRole.value   = user.role;
                localStorage.setItem('token', resource.token);
                localStorage.setItem('userId', String(user.id));
                localStorage.setItem('email', user.email);
                localStorage.setItem('role', user.role);
                isSignedIn.value = true;
                errors.value = [];
                notifySuccess('toast.signed-in');
                router.push({ name: 'orders-list' });
            })
            .catch(error => {
                isSignedIn.value = false;
                errors.value.push(error);
                notifyError('toast.sign-in-failed');
            });
    }

    /**
     * Executes the sign-up use case and routes the user to the sign-in screen.
     * @param {import('../domain/sign-up.command.js').SignUpCommand} signUpCommand - Registration data.
     * @param {import('vue-router').Router} router - Router used to redirect on result.
     * @returns {Promise<void>}
     */
    function signUp(signUpCommand, router) {
        return iamApi.signUp(signUpCommand)
            .then(() => {
                // The backend now persists the name at registration time, so there is
                // no separate profile to create.
                errors.value = [];
                notifySuccess('toast.registered');
                router.push({ name: 'login' });
            })
            .catch(error => {
                errors.value.push(error);
                notifyError('toast.register-failed');
            });
    }

    /**
     * Executes the invitation-gated carpenter sign-up use case and routes to sign-in.
     * Mirrors {@link signUp} but hits the closed `/auth/sign-up-carpenter` endpoint;
     * a wrong invitation code surfaces as a 403 pushed into `errors`.
     * @param {import('../domain/sign-up-carpenter.command.js').SignUpCarpenterCommand} command - Registration data + code.
     * @param {import('vue-router').Router} router - Router used to redirect on result.
     * @returns {Promise<void>}
     */
    function signUpCarpenter(command, router) {
        return iamApi.signUpCarpenter(command)
            .then(() => {
                // The backend now persists the name at registration time, so there is
                // no separate profile to create.
                errors.value = [];
                notifySuccess('toast.registered');
                router.push({ name: 'login' });
            })
            .catch(error => {
                errors.value.push(error);
                notifyError('toast.register-failed');
            });
    }

    /**
     * Loads the user directory, optionally filtered by role, into `users`.
     * @param {?string} [role] - Role filter (e.g. 'Carpenter').
     * @returns {Promise<void>}
     */
    function fetchUsers(role = null) {
        return iamApi.getUsers(role)
            .then(response => {
                const resources = Array.isArray(response.data) ? response.data : [];
                users.value = resources.map(UserAssembler.toEntityFromResource);
            })
            .catch(error => { errors.value.push(error); });
    }

    /**
     * Resolves a user id to a display name: the user's full name (now carried on the
     * user resource in the workshop-tool model), falling back to the email, then `#id`.
     * Requires `users` loaded.
     * @param {?number} id - User identifier.
     * @returns {string} Display name.
     */
    function displayNameById(id) {
        if (!id) return '';
        const user = users.value.find(u => u.id === id);
        if (!user) return `#${id}`;
        return user.fullName || user.email || `#${id}`;
    }

    /** Clears the active IAM session and local auth artifacts. */
    function signOut(router) {
        currentUserId.value = 0;
        currentEmail.value  = null;
        currentRole.value   = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        isSignedIn.value = false;
        errors.value = [];
        notifySuccess('toast.signed-out');
        if (router) router.push({ name: 'login' });
    }

    return {
        isSignedIn,
        currentUserId,
        currentEmail,
        currentRole,
        currentToken,
        errors,
        users,
        signIn,
        signUp,
        signUpCarpenter,
        signOut,
        fetchUsers,
        displayNameById
    };
});

export default useIamStore;
