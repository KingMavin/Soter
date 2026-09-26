import { Test, TestingModule } from '@nestjs/testing';

const createdModules: TestingModule[] = [];

const originalCreateTestingModule = Test.createTestingModule;

Test.createTestingModule = function (metadata: any) {
  const testingModuleBuilder = originalCreateTestingModule.call(Test, metadata);
  const originalCompile = testingModuleBuilder.compile;

  testingModuleBuilder.compile = async function () {
    const module = await originalCompile.call(testingModuleBuilder);
    createdModules.push(module);
    return module;
  };

  return testingModuleBuilder;
};

afterEach(async () => {
  if (createdModules.length > 0) {
    await Promise.all(createdModules.map(m => m.close()));
    createdModules.length = 0;
  }
});
