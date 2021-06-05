<template>
    <vApp>
        <vAppBar
            app
        >
            <vToolbarTitle>Stuff Organizer</vToolbarTitle>
            <vSpacer />
            <v-progress-circular
                v-if="appFileState === 'saving'"
                size="20"
                class="ma-3"
                indeterminate
                color="grey"
            />
            <vIcon
                v-if="appFileState === 'saved'"
                class="ma-3"
                color="green"
            >
                mdi-check
            </vIcon>
            <vIcon
                v-if="appFileState === 'error'"
                class="ma-3"
                color="red"
            >
                mdi-alert-circle
            </vIcon>
        </vAppBar>
        <vContent>
            <v-overlay
                :value="loading"
            >
                <v-progress-circular
                    size="40"
                    indeterminate
                    color="grey"
                />
            </v-overlay>
            <vContainer fluid>
                <organizer
                    ref="organizer"
                    @showMessage="showSnackbar"
                    @setAppFileState="setAppFileState"
                />
                <vRow
                    v-show="!loading && !isSignedIn"
                    fill-height
                    justify="center"
                >
                    <vCard
                        class="pa-5"
                    >
                        <vCardTitle class="justify-center">
                            Connection
                        </vCardTitle>
                        <vCardText>
                            In order to use this app, you need to allow this app to access Drive.
                        </vCardText>
                        <vCardActions
                            v-if="!isSigningIn"
                            class="justify-center"
                        >
                            <vBtn
                                @click="signIn"
                            >
                                <vIcon left>
                                    mdi-google-drive
                                </vIcon>
                                Connect to Drive
                            </vBtn>
                        </vCardActions>
                        <vCardActions
                            v-if="isSigningIn"
                            class="justify-center"
                        >
                            <v-progress-circular
                                size="20"
                                indeterminate
                                color="grey"
                            />
                        </vCardActions>
                    </vCard>
                </vRow>
            </vContainer>
        </vContent>
        <vSnackbar
            v-model="snackbar.visible"
            :top="true"
            :color="snackbar.color"
        >
            {{ snackbar.text }}
            <vSpacer />
            <vBtn
                text
                @click="snackbar.visible = false"
            >
                Close
            </vBtn>
        </vSnackbar>
    </vApp>
</template>

<script>
import gapi from '@/assets/js/gapi';
import organizerComponent from '@/components/Organizer.vue';

export default {

    name: 'App',

    components: {
        organizer: organizerComponent,
    },

    data: () => ({
        isSigningIn: false,
        appFileState: null,
        loading: true,
        isSignedIn: false,
        snackbar: {
            visible: false,
            text: '',
            color: '',
        },
    }),

    computed: {
    },

    async created() {
        await gapi.init(this.$gapi.getGapiClient());
        await this.updateIsSignedIn();
    },

    methods: {

        async updateIsSignedIn() {
            this.isSignedIn = gapi.isSignedIn();
            if (this.isSignedIn) {
                this.appFileState = 'saving';
                await this.$refs.organizer.init();
            }
            this.loading = false;
        },

        async signIn() {
            this.isSigningIn = true;
            try {
                await gapi.signIn();
                this.isSigningIn = false;
                this.loading = true;
                this.updateIsSignedIn();
            } catch (err) {
                this.showSnackbar('You need to allow this app in order to use it.', 'error');
            }
        },

        showSnackbar(text, color) {
            this.snackbar.visible = true;
            this.snackbar.text = text;
            this.snackbar.color = color;
        },

        async saveAppFile() {
            this.saveIcon.icon = 'mdi-loading';
            this.saveIcon.color = 'grey';


            this.saveIcon.icon = 'mdi-check';
            this.saveIcon.color = 'green';
        },

        setAppFileState(state) {
            this.appFileState = state;
        },


    },

};
</script>
