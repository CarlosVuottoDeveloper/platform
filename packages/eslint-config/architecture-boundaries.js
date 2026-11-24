const OUTER_LAYERS = [
  '**/services/**',
  '**/screens/**',
  '**/hooks/**',
  '**/components/**',
  '**/context/**',
  '**/store/**',
  '**/navigation/**',
];

/**
 * @param {string} appSrcDir
 * @returns {import("eslint").Linter.Config[]}
 */
export function domainServicesBoundaries(appSrcDir) {
  return [
    {
      files: [`${appSrcDir}/domain/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              {
                group: OUTER_LAYERS,
                message:
                  'domain/ must not import from services/, screens/, hooks/, components/, context/, store/, or navigation/ — it should be testable with zero mocks (see CLAUDE.md "Clean Architecture").',
              },
            ],
          },
        ],
      },
    },
    {
      files: [`${appSrcDir}/services/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              {
                group: OUTER_LAYERS.filter((p) => p !== '**/services/**'),
                message:
                  'services/ must not import from screens/, hooks/, components/, context/, store/, or navigation/ — data access belongs here, composition/presentation does not (see CLAUDE.md "Clean Architecture").',
              },
            ],
          },
        ],
      },
    },
  ];
}
