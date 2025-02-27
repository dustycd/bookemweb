<body>

  <h1>
    <img src="public/Bookem-logo.png" alt="Bookem Logo" title="Bookem Logo" />
    <br />
    Bookem
  </h1>
  <p>
    <strong>Bookem</strong> is a community-driven platform where book enthusiasts can trade, discuss, and discover new books.
  </p>

  <hr />

  <h2>Table of Contents</h2>
  <ul class="anchor-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#environment-variables">Environment Variables</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ul>

  <hr />

  <h2 id="features">Features</h2>
  <ul>
    <li><strong>User Authentication</strong>: Secure login and sign-up using Supabase Auth.</li>
    <li><strong>Book Catalog</strong>: Browse a list of books available for trade.</li>
    <li><strong>Personal Library</strong>: Save and rate your favorite books.</li>
    <li><strong>Trade Offers</strong>: Create offers, request trades, and manage pending requests.</li>
    <li><strong>Social Forum</strong>: Engage in community discussions.</li>
    <li><strong>Friend Management</strong>: Send and accept friend requests.</li>
  </ul>

  <hr />

  <h2 id="tech-stack">Tech Stack</h2>
  <ul>
    <li><strong>Frontend</strong>: React, React Router, Vite</li>
    <li><strong>Backend</strong>: <a href="https://supabase.com/">Supabase</a> (database, auth, file storage)</li>
    <li><strong>Styling</strong>: Custom CSS</li>
    <li><strong>Icons</strong>: <a href="https://react-icons.github.io/react-icons/">React Icons</a></li>
  </ul>

  <hr />

  <h2 id="getting-started">Getting Started</h2>

  <h3>Prerequisites</h3>
  <ol>
    <li><strong>Node.js</strong> (version 14 or higher recommended)</li>
    <li><strong>npm</strong> or <strong>yarn</strong> (for dependency management)</li>
    <li>A <strong>Supabase</strong> project (for database & authentication)</li>
  </ol>

  <h3>Installation</h3>
  <ol>
    <li><strong>Clone the repository</strong>:
      <pre><code>git clone https://github.com/your-username/bookem1.0.git
cd bookem1.0
</code></pre>
    </li>
    <li><strong>Install dependencies</strong>:
      <pre><code>npm install
# or
yarn install
</code></pre>
    </li>
  </ol>

  <h3>Running Locally</h3>
  <ol>
    <li><strong>Set up environment variables</strong> in a <code>.env</code> file (see <a href="#environment-variables">Environment Variables</a>).</li>
    <li><strong>Start the development server</strong>:
      <pre><code>npm run dev
# or
yarn dev
</code></pre>
    </li>
    <li>Open your browser and navigate to <strong>http://localhost:5173</strong> (or whichever port Vite shows) to see <strong>Bookem1.0</strong> in action.</li>
  </ol>

  <hr />

  <h2 id="project-structure">Project Structure</h2>
  <pre><code>bookem1.0/
├─ public/
│  ├─ Bookem-logo.png
│  └─ ...
├─ src/
│  ├─ components/
│  ├─ contexts/
│  ├─ pages/
│  ├─ styles/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ supabaseClient.js
├─ .env
├─ .gitignore
├─ package.json
├─ package-lock.json
├─ README.md
└─ vite.config.js
</code></pre>
  <ul>
    <li><strong>public/</strong>: Public assets (logo, icons, etc.).</li>
    <li><strong>src/</strong>: Application source code.
      <ul>
        <li><strong>components/</strong>: Reusable UI components (e.g., Sidebar, Toast).</li>
        <li><strong>contexts/</strong>: Context providers (e.g., AuthContext).</li>
        <li><strong>pages/</strong>: Page-level components (e.g., HomePage, ProfilePage).</li>
        <li><strong>styles/</strong>: Global and component-specific CSS files.</li>
        <li><strong>App.jsx</strong>: Main app component with routes.</li>
        <li><strong>main.jsx</strong>: Entry point, renders <code>&lt;App /&gt;</code>.</li>
        <li><strong>supabaseClient.js</strong>: Supabase configuration.</li>
      </ul>
    </li>
  </ul>

  <hr />

  <h2 id="environment-variables">Environment Variables</h2>
  <p>
    Create a file named <code>.env</code> in the project root with the following variables (replace with your actual Supabase info):
  </p>
  <pre><code>VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
</code></pre>
  <p><strong>Note:</strong> Never commit your real keys to a public repository.</p>

  <hr />

  <h2 id="contributing">Contributing</h2>
  <p>We welcome contributions to <strong>Bookem1.0</strong>! To contribute:</p>
  <ol>
    <li>Fork the repository.</li>
    <li>Create a feature branch.</li>
    <li>Commit your changes with clear messages.</li>
    <li>Open a Pull Request detailing your changes.</li>
  </ol>

  <hr />

  <h2 id="license">License</h2>
  <p>
    This project is licensed under the <a href="LICENSE">MIT License</a>.
    Feel free to use and modify it for personal or commercial projects.
  </p>

  <hr />

  <p><strong>Happy Reading &amp; Trading!</strong></p>

</body>
</html>
