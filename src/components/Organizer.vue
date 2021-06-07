<template>
    <div>
        <vMenu
            v-model="menu.show"
            :position-x="menu.x"
            :position-y="menu.y"
            :close-on-content-click="false"
            absolute
            offset-y
        >
            <vList>
                <vListItem
                    v-show="menu.action === 'delete'"
                    @click="deleteElement"
                >
                    <vListItemTitle>
                        Remove
                    </vListItemTitle>
                </vListItem>
                <vListItem
                    v-show="menu.action === 'edit'"
                >
                    <vTextField
                        ref="edit"
                        v-on:keydown.enter="editElement"
                        v-model="menu.value"
                        :rules="rules"
                    />
                </vListItem>
            </vList>
        </vMenu>
        <vRow>
            <vCol
                cols="12"
                md="6"
                sm="9"
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
                    ref="container"
                    v-model="form.container"
                    :items="containers"
                    label="container"
                    :rules="rules"
                    autocomplete="off"
                    @keydown.enter="createItem"
                />
            </vCol>
            <vCol
                cols="10"
                md="3"
                sm="4"
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
            <vCol
                cols="2"
            >
                <v-checkbox
                    v-model="singleItem"
                    label="single item"
                    value="singleItem"
                ></v-checkbox>
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
                        <vCard
                            @contextmenu="showMenu(containerIndex, null, 'delete', $event)"
                            @dblclick="showMenu(containerIndex, null, 'edit', $event)"
                        >
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
                                    @contextmenu="showMenu(containerIndex, itemIndex, 'delete', $event)"
                                    @dblclick="showMenu(containerIndex, itemIndex, 'edit', $event)"
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
        menu: {
            show: false,
            action: null,
            x: null,
            y: null,
            containerIndex: null,
            itemIndex: null,
            value: null,
        },
        saving: false,
        waiting: false,
        selTags: [],
        rules: [
            (v) => !!v || 'Required',
        ],
        input: null,
        singleItem: false,
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

        async showMenu(containerIndex, itemIndex, action, e) {
            e.preventDefault();
            this.menu.show = false;
            this.menu.x = e.clientX - 10;
            this.menu.y = e.clientY;
            this.menu.containerIndex = containerIndex;
            this.menu.itemIndex = itemIndex;
            this.menu.action = action;
            this.menu.show = true;
            if (action === 'edit') {
                let element = this.appFile.containers[containerIndex];
                if (itemIndex !== null) element = element.items[itemIndex];
                this.menu.value = element.name;
                await this.$nextTick();
                const el = this.$refs.edit.$el.querySelector('input');
                await this.$nextTick();
                setTimeout(() => el.select(), 100);
                //el.select();
                // this.$nextTick(() => this.$refs.edit.$el.querySelector('input').select() );
            }
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

            this.$refs.item.resetValidation();

            if (this.singleItem) {
                this.$refs.container.resetValidation();
                this.form.container = null;
                this.$refs.container.focus();
            } else {
                this.$refs.item.focus();
            }
            
            this.form.item = null;
        },

        deleteElement() {
            if (this.menu.itemIndex == null) {
                this.$delete(this.appFile.containers, this.menu.containerIndex);
            } else {
                this.$delete(this.appFile.containers[this.menu.containerIndex].items, this.menu.itemIndex);
            }
            this.menu.show = false;
            this.updateAppFile();
        },

        editElement() {
            if (this.menu.itemIndex === null) {
                this.appFile.containers[this.menu.containerIndex].name =  this.menu.value;
            } else {
                this.appFile.containers[this.menu.containerIndex].items[this.menu.itemIndex].name = this.menu.value;
            }
            this.menu.show = false;
            this.updateAppFile();
        },

        deleteAppFile() {
            gapi.deleteAppFile();
        },

    },
};

</script>
