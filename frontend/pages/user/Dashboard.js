const Dashboard = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome to your dashboard! Here you can manage your activities.</p>

            {/* Example dashboard content */}
            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow">
                <h2 className="text-lg font-semibold">Quick Overview</h2>
                <ul className="list-disc pl-5 mt-2">
                    <li>Recent Activities</li>
                    <li>Account Settings</li>
                    <li>Notifications</li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;