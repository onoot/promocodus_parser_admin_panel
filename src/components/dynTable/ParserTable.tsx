import React, { useMemo, useState } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

const TableComponent = ({ columns, data, onSortChange }) => {
    const [sortBy, setSortBy] = useState([]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        useMemo(() => ({ columns, data, initialState: { sortBy } }), [columns, data, sortBy]),
        useSortBy
    );

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        if (onSortChange) {
            onSortChange(newSortBy);
        }
    };

    return (
        <div style={{ width: "max-content", height: "max-content", overflow: 'auto' }}>
            <Table {...getTableProps()} size="small" style={{ borderCollapse: 'collapse', width: '100%', height: '100%' }}>
                <TableHead>
                    {headerGroups.map(headerGroup => (
                        // eslint-disable-next-line react/jsx-key
                        <TableRow {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                // eslint-disable-next-line react/jsx-key
                                <TableCell
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    style={{
                                        fontWeight: 'bold',
                                        background: '#f2f2f2',
                                        border: '1px solid #dddddd',
                                        padding: '8px',
                                    }}
                                >
                                    {column.render('Header')}
                                    <span>
                                        {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                                    </span>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            // eslint-disable-next-line react/jsx-key
                            <TableRow {...row.getRowProps()} style={{ border: '1px solid #dddddd' }}>
                                {row.cells.map(cell => (
                                    // eslint-disable-next-line react/jsx-key
                                    <TableCell
                                        {...cell.getCellProps()}
                                        style={{
                                            border: '1px solid #dddddd',
                                            padding: '8px',
                                        }}
                                    >
                                        {cell.render('Cell')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default TableComponent;
