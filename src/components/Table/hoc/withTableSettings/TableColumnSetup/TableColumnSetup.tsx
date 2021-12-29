import React from 'react';

import {block} from '../../../../utils/cn';
import {List} from '../../../../List';
import {Icon} from '../../../../Icon';
import {Popup} from '../../../../Popup';
import {Button} from '../../../../Button';
import {GearIcon} from '../../../../icons/GearIcon';
import {TickIcon} from './TickIcon';
import {LockIcon} from './LockIcon';

import {TableColumnSetupItem} from '../withTableSettings';
import {PopperPlacement} from 'src/components/utils/usePopper';

import './TableColumnSetup.scss';

const b = block('table-column-setup');

type Item = TableColumnSetupItem;

interface TableColumnSetupProps {
    // for Button
    disabled?: boolean;
    switcher?: React.ReactElement | undefined;

    // for List
    items: Item[];
    sortable?: boolean;
    filterable?: boolean;

    onUpdate: (updated: Item[]) => void;
    popupWidth?: string;
    popupPlacement?: PopperPlacement;
    getItemTitle?: (item: Item) => TableColumnSetupItem['title'];
    showStatus?: boolean;
    className?: string;
}

export const TableColumnSetup = (props: TableColumnSetupProps) => {
    const {
        switcher,
        disabled,
        popupWidth,
        popupPlacement,
        className,
        items: propsitems,
        getItemTitle = (item: Item) => item.title,
        sortable = true,
        filterable = false,
        showStatus,
    } = props;

    const [focused, setFocused] = React.useState(false);
    const [items, setItems] = React.useState<Item[]>([]);
    const [currentItems, setCurrentItems] = React.useState<Item[]>([]);
    const [requiredItems, setRequiredItems] = React.useState<Item[]>([]);

    const refControl = React.useRef(null);

    const LIST_ITEM_HEIGHT = 36;

    const getRequiredItems = (list: Item[]) =>
        list
            .filter(({required}) => required)
            .map((column) => ({
                ...column,
                disabled: true,
            }));

    const getConfigurableItems = (list: Item[]) => list.filter(({required}) => !required);

    React.useEffect(() => {
        if (propsitems !== items) {
            setItems(propsitems);
            setRequiredItems(getRequiredItems(propsitems));
            setCurrentItems(getConfigurableItems(propsitems));
        }
    }, [items, propsitems]);

    const getListHeight = (list: Item[]) => {
        const itemHeight = LIST_ITEM_HEIGHT;

        return Math.min(5, list.length) * itemHeight + itemHeight / 2;
    };

    const getRequiredListHeight = (list: Item[]) => {
        return list.length * LIST_ITEM_HEIGHT;
    };

    const onUpdate = (value: Item[]) => {
        setCurrentItems(value);
    };

    const setInitialState = () => {
        setFocused(false);
        setRequiredItems(getRequiredItems(items));
        setCurrentItems(getConfigurableItems(items));
    };

    const onClosePopup = () => {
        setInitialState();
    };

    const onControlClick = () => {
        if (!disabled) {
            setFocused(!focused);
            setRequiredItems(getRequiredItems(items));
            setCurrentItems(getConfigurableItems(items));
        }
    };

    const onApplyClick = () => {
        setInitialState();

        const newItems = requiredItems.concat(currentItems);

        if (items !== newItems) {
            props.onUpdate(newItems);
        }
    };

    const renderItem = (item: Item) => {
        return (
            <div className={b('item-content')}>
                {item.required ? (
                    <div className={b('lock-wrap', {visible: item.selected})}>
                        <Icon data={LockIcon} />
                    </div>
                ) : (
                    <div className={b('tick-wrap', {visible: item.selected})}>
                        <Icon data={TickIcon} className={b('tick')} width={10} height={10} />
                    </div>
                )}
                <div className={b('title')}>{getItemTitle(item)}</div>
            </div>
        );
    };

    const onItemClick = (value: Item) => {
        const newItems = currentItems.map((item) =>
            item === value ? {...item, selected: !item.selected} : item,
        );
        onUpdate(newItems);
    };

    const makeOnSortEnd =
        (list: Item[]) =>
        ({oldIndex, newIndex}: {oldIndex: number; newIndex: number}) => {
            onUpdate(List.moveListElement(list.slice(), oldIndex, newIndex));
        };

    const getCountSelected = () => {
        return items.reduce((acc, cur) => (cur.selected ? acc + 1 : acc), 0);
    };

    const renderStatus = () => {
        if (!showStatus) {
            return null;
        }

        const selected = getCountSelected();
        const all = propsitems.length;
        const status = `${selected}/${all}`;

        return <span className={b('status')}>{status}</span>;
    };

    const renderRequiredColumns = () => {
        const hasRequiredColumns = requiredItems.length;

        if (!hasRequiredColumns) {
            return null;
        }

        return (
            <List
                items={requiredItems}
                itemHeight={LIST_ITEM_HEIGHT}
                itemsHeight={getRequiredListHeight}
                filterable={filterable}
                renderItem={renderItem}
                itemsClassName={b('items')}
                itemClassName={b('item')}
                virtualized={false}
            />
        );
    };

    const renderConfigurableColumns = () => {
        return (
            <List
                items={currentItems}
                itemHeight={LIST_ITEM_HEIGHT}
                itemsHeight={getListHeight}
                sortable={sortable}
                filterable={filterable}
                sortHandleAlign={'right'}
                onSortEnd={makeOnSortEnd(currentItems)}
                onItemClick={onItemClick}
                renderItem={renderItem}
                itemsClassName={b('items')}
                itemClassName={b('item')}
                virtualized={false}
            />
        );
    };

    return (
        <div className={b(null, className)}>
            <div className={b('control')} ref={refControl} onClick={onControlClick}>
                {switcher || (
                    <Button disabled={disabled}>
                        <Icon data={GearIcon} />
                        Columns
                        {renderStatus()}
                    </Button>
                )}
            </div>
            <Popup
                anchorRef={refControl}
                placement={popupPlacement || ['bottom-start', 'bottom-end', 'top-start', 'top-end']}
                open={focused}
                onClose={onClosePopup}
                className={b('popup')}
                style={{width: popupWidth}}
            >
                {renderRequiredColumns()}
                {renderConfigurableColumns()}
                <div className={b('controls')}>
                    <Button view="action" width="max" onClick={onApplyClick}>
                        Apply
                    </Button>
                </div>
            </Popup>
        </div>
    );
};