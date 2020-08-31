<template>
    <div>
        <vMenu
            v-model="itemMenu.show"
            :position-x="itemMenu.x"
            :position-y="itemMenu.y"
            :close-on-content-click="false"
            absolute
            offset-y
        >
            <vList>
                <vListItem
                    v-show="true || !itemMenu.edit.show"
                    @click="showItemEditmenu($event)"
                >
                    <vListItemTitle>
                        Edit
                    </vListItemTitle>
                </vListItem>
                <vListItem
                    v-show="true || !itemMenu.edit.show"
                    @click="createItem"
                >
                    <vListItemTitle>
                        Remove
                    </vListItemTitle>
                </vListItem>
                <vListItem
                    v-show="true || itemMenu.edit.show"
                >
                    <vTextField
                        ref="editItem"
                        v-model="itemMenu.edit.value"
                        :rules="rules"
                        @focus="showItemEditmenu"
                    />
                    <vBtn class="ml-3">
                        Save
                    </vBtn>
                    <vBtn class="ml-3">
                        Cancel
                    </vBtn>
                </vListItem>
            </vList>
        </vMenu>
        <vRow>
            <vCol
                cols="12"
            >
                <vTextField
                    ref="search"
                    v-model="search"
                    label="Search"
                    autocomplete="off"
                />
            </vCol>
        </vRow>
        <vRow>
            <vCol
                cols="12"
                md="3"
                sm="6"
            >
                <vCombobox
                    v-model="form.container"
                    :items="containers"
                    label="container"
                    :rules="rules"
                    autocomplete="off"
                    @keydown.enter="createItem"
                />
            </vCol>
            <vCol
                cols="12"
                md="3"
                sm="6"
            >
                <vTextField
                    ref="item"
                    v-model="form.item"
                    label="Item"
                    :rules="rules"
                    autocomplete="off"
                    @keydown.enter="createItem"
                />
            </vCol>
        </vRow>
        <vCard
            v-for="(container, containerIndex) in appFile.containers"
            :key="containerIndex"
            v-show="filter[containerIndex].name"
            class="ma-2"
        >
            <vContainer>
                <vRow>
                    <vCol
                        cols="12"
                        md="3"
                    >
                        <vCard>
                            <vCardSubtitle>
                                {{ container.name }}
                            </vCardSubtitle>
                        </vCard>
                    </vCol>
                    <vCol
                        cols="12"
                        md="9"
                    >
                        <vChipGroup
                            v-model="selTags"
                            multiple
                            column
                            active-class="primary--text"
                        >
                            <draggable
                                class="list-group"
                                group="test"
                                :list="container.items"
                                @change="updateAppFile"
                                @start="drag = true"
                                @end="drag = false"
                            >
                                <vChip
                                    v-for="(item, itemIndex) in container.items"
                                    :key="`${containerIndex}-${itemIndex}`"
                                    :input-value="filter[containerIndex].items[itemIndex]"
                                    transition="slide-y-transition"
                                    @contextmenu="showItemMenu(containerIndex, itemIndex, $event)"
                                    @click="test('click')"
                                    @dblclick="test('double click')"
                                >
                                    {{ item.name }}
                                </vChip>
                            </draggable>
                        </vChipGroup>
                    </vCol>
                </vRow>
            </vContainer>
        </vCard>
    </div>
</template>

<script>

// import gapi from '@/assets/js/gapi';
import gapi from '@/assets/js/gapi';
import draggable from 'vuedraggable';

export default {

    components: {
        draggable,
    },

    data: () => ({
        drag: false,
        form: {
            container: null,
            item: null,
        },
        search: '',
        appFile: {
            containers: [],
        },
        newTagMenu: false,
        itemMenu: {
            show: false,
            x: null,
            y: null,
            containerIndex: null,
            itemIndex: null,
            edit: {
                show: false,
                value: null,
            },
        },
        saving: false,
        waiting: false,
        selTags: [],
        rules: [
            (v) => !!v || 'Required',
        ],
        input: null,
    }),

    computed: {
        containers() {
            return this.appFile.containers.map((c) => c.name);
        },

        filter() {
            const s = this.search.toLowerCase();
            return this.appFile.containers.map((c) => {
                const items = c.items.map((i) => s !== '' && i.name.toLowerCase().includes(s));
                const containerIncludes = c.name.toLowerCase().includes(s) || items.some((i) => i);
                return { name: containerIncludes, items};
            });
        },
    },

    created: () => {

    },

    methods: {
        async init() {
            try {
                const res = await gapi.getAppFile();
                this.appFile = res.result;
                this.$emit('setAppFileState', 'saved');
                this.$refs.search.focus();
            } catch (err) {
                this.$emit('showMessage', 'Unkown error While getting app file', 'error');
            }
        },

        showItemMenu(containerIndex, itemIndex, e) {
            e.preventDefault();
            this.itemMenu.show = false;
            this.itemMenu.edit.show = false;
            this.itemMenu.x = e.clientX - 10;
            this.itemMenu.y = e.clientY;
            this.itemMenu.containerIndex = containerIndex;
            this.itemMenu.itemIndex = itemIndex;
            this.itemMenu.show = true;
        },

        showItemEditmenu(e) {
            e.preventDefault();
            this.itemMenu.edit.value = this.appFile.containers[this.itemMenu.containerIndex].items[this.itemMenu.itemIndex].name;
            this.itemMenu.edit.show = true;
            const el = this.$refs.editItem.$el.querySelector('input');
            this.$nextTick(() => el.select());
        },

        async updateAppFile() {
            this.waiting = true;
            if (this.saving) return;
            this.saving = true;
            this.$emit('setAppFileState', 'saving');
            try {
                while (this.waiting) {
                    this.waiting = false;
                    // eslint-disable-next-line no-await-in-loop
                    await gapi.updateAppFile(this.appFile);
                }
                this.saving = false;
                this.$emit('setAppFileState', 'saved');
            } catch (err) {
                this.waiting = false;
                this.saving = false;
                this.$emit('setAppFileState', 'error');
                this.$emit('showMessage', 'Error while saving app file.', 'error');
            }
        },

        createItem() {
            if (!this.form.container || !this.form.item) return;
            const existing = this.appFile.containers.find((c) => c.name === this.form.container);
            if (existing && existing.items.find((i) => i === this.form.item)) {
                this.$emit('showMessage', 'Item already exists in container', 'error');
                return;
            }
            const item = { name: this.form.item };
            if (existing) {
                existing.items.push(item);
            } else {
                this.appFile.containers.push({
                    name: this.form.container,
                    items: [item],
                });
            }
            this.updateAppFile();

            this.form.item = null;
            this.$refs.item.resetValidation();
            this.$refs.item.focus();
        },

        deleteAppFile() {
            gapi.deleteAppFile();
        },

        test(message) {
            console.log(message);
        },
    },
};

</script>
