import Category from '../Category';

export default function CategoryCustomOptions() {
  return (
    <div style={{ width: 300 }}>
      <Category
        ariaLabel="Collection"
        defaultValue="sale"
        options={[
          { id: 'all', label: 'All' },
          { id: 'new', label: 'New' },
          { id: 'sale', label: 'Sale' }
        ]}
      />
    </div>
  );
}
